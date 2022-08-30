require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const session = require('express-session');
/* const cookieParser = require('cookie-parser'); */
const MongoStore = require('connect-mongo');
const passport = require('./passport');
const minimist = require('minimist');
const numCPUs = require('os').cpus().length;
const cluster = require('cluster');
const compression = require('compression');
const logger = require('./utils/loggers/winston');
const multer = require('multer');

const apiRoutes = require('./src/routes')
/* const tableProducts = require('./src/containers/productContainer_mysql'); */
const { Container, colProduct } = require('./src/containers/containerMongoDb');
const colMessages = require('./src/containers/messagesContainer_firebase');

const app = express();
const httpServer = new HttpServer(app);
const ioServer = new SocketServer(httpServer);

/* app.use(cookieParser()); */
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_ATLAS_CONNECTION,
        dbName: 'ecommerce',
        //Según la docu, si la cookie tiene seteado el tiempo, usa ese
        ttl: 10 * 60,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }),
    secret: 'desafio26',
    resave: true,
    rolling: true,
    /* cookie: { */
    /*     maxAge: 60000 */
    /* }, */
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(compression());

app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'index.hbs',
    })
);

app.set('views', './public/views');
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    logger.info(`ruta: ${req.url}, método: ${req.method}`);
    next();
});

const storage = multer.diskStorage({
    destination: './public/avatars',
    filename: (req, file, cb) => {
      const fileName = req.body.username + ".jpeg";
      cb(null, fileName)
    }
});

const uploader = multer({storage: storage});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', uploader.single('avatar'), passport.authenticate('register', {failureRedirect: '/failregister', failureMessage: true}), (req, res) => {
    const registerSuccess = 'Registrado exitosamente. Ir a Login para ingresar';
    res.render('register', {registerSuccess});
});

app.get('/failregister', (req, res) => {
    res.render('failregister')
});

app.get('/login', (req, res) => {
    if (!req.session.user) 
        res.render('login');
    else {
        const user = req.session.user;
        res.render('home',  {user});
    }
});

app.post('/login', passport.authenticate('login', {failureRedirect: '/faillogin', failureMessage: true}), (req, res) => {
    const user = {
        username: req.user[0].username,
        name: req.user[0].name,
        address: req.user[0].address,
        age: req.user[0].age,
        phone: req.user[0].phone
    }
    req.session.user = user;
    res.render('home',  {user});
});

app.get('/faillogin', (req, res) => {
    res.render('faillogin');
});

const isLogin = (req, res, next) => {
    if (!req.session.user) { 
        res.render('login');
    } else next();
};

app.use('/', isLogin, apiRoutes);

app.post('/logout', isLogin, async (req, res) => {
    const username = req.session.user.username;
    req.session.destroy((err) => {
        console.log(err);
        res.render('logout', {username})
    });
});

const args = process.argv.slice(2);
const argsparse = minimist(args, {
    default: {
        port: 8080,
        mode: 'fork'
    },
    alias: {
        p: 'port',
        m: 'mode'
    }
});

const port = process.env.PORT || argsparse.port

//Ruta info
app.get('/info', (req, res) => {
    let arguments = 'No se ingresaron argumentos';
    if (args.length !== 0) {
        const puerto = JSON.stringify({port})
        arguments = puerto ;
    }
    const info = {
        arguments: arguments ,
        platform: process.platform,
        version: process.version,
        memory: process.memoryUsage().rss,
        path: process.execPath,
        id: process.pid,
        folder: process.cwd(),
        numCPUs: numCPUs
    };
    console.log("info", info);
    res.render('info', {info});
});


//Ruta para test con Faker
app.get('/api/productos-test', isLogin, async (req, res) => {
    const mocks = await tableProducts.generateMock();
    console.log(mocks)
    res.render('main-faker', {mocks})
});

// Para cualquier ruta no implementada
app.use((req, res) => {
    logger.warn(`ruta: ${req.url}, método: ${req.method} no implementada`);
    res.status(404).send("ruta no implementada");
});

console.log(argsparse.mode)
if (argsparse.mode === "cluster") {
    if (cluster.isMaster) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }    
    } else {
        httpServer.listen(port, () => {
            console.log(`escuchando desafio 32 en puerto ${port}, pid: ${process.pid}`);
        });
    }
} else {
    httpServer.listen(port, () => {
        console.log(`escuchando desafio 32 en puerto ${port}, pid: ${process.pid}`);
    });
} 


ioServer.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    const getTables = (async () => {
        socket.emit('messages', await colMessages.getAll());  
        /* socket.emit('products', await tableProducts.getAll()); */
        socket.emit('products', await colProduct.getAll());
    }) ();

    socket.on("newMessage", (message) => {
        const saveMessage = (async (message) => {
            const messagesNorm = await colMessages.save(message);
            ioServer.sockets.emit("messages", messagesNorm);
        }) (message);
    });
    socket.on('newProduct', (product) => {
        const getProducts = (async (product) => {
            await tableProducts.save(product);
            const allProducts = await tableProducts.getAll()
            ioServer.sockets.emit("products", allProducts);
        }) (product);
    });
});
