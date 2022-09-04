const nodemailer = require('nodemailer');
const logger = require('./loggers/winston');

const sendMail = (dataUser) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: 'mvszewczuk@gmail.com',
            pass: process.env.PW_GMAIL
        }
    });

    let subject = "";
    let content = "";
    let attachments = [];

    if (dataUser.products) {
        subject = `Nuevo pedido de ${dataUser.user.name}, email: ${dataUser.user.username}`
        let list = "";
        dataUser.products.forEach(product => {
            list = list + `<li>${product.title}</li>`            
        });
        content = `<h2>Productos comprados:</h2>
                    <ul>
                        ${list}
                    </ul>`
    } else {
        subject = "Nuevo registro"
        content = `<h1>Datos del nuevo registro:</h1>
            <p>nombre de usuario (email): ${dataUser.username}</p>
            <p>nombre y apellido: ${dataUser.name}</p>
            <p>dirección: ${dataUser.address}</p>
            <p>edad: ${dataUser.age}</p>
            <p>teléfono: ${dataUser.phone}</p>`
        attachments = [
            {
                path: `../PF3B/public/avatars/${dataUser.username}.jpeg`
            }
        ]
    };


    const mailOptions = {
        from: 'Backend <ms@coder.com>',
        to: process.env.GMAIL_USER,
        subject: subject,
        html: content,
        attachments: attachments
    };
      
    transporter.sendMail(mailOptions)
    .then((result) => {
        logger.info(result);
    }).catch (console.log);
};

module.exports = sendMail;
