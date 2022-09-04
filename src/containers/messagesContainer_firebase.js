const admin = require('firebase-admin');
const normalize = require('normalizr');
const logger = require('../../utils/loggers/winston');
const print = require('../../utils/print');
const firebaseConfig = require('./firebaseConfig');

/* admin.initializeApp({ */
/*     credential: admin.credential.cert(process.env.FIREBASE_CONFIG) */
/* }); */

//Separo los items del json de firebase para poder usarlo en heroku
/* admin.initializeApp({ */
/*     credential: admin.credential.cert({ */
/*         dev: { */
/*         type: process.env.FIREBASE_CONFIG_TYPE, */
/*         project_id: process.env.FIREBASE_CONFIG_PROJECT_ID, */
/*         private_key_id: process.env.FIREBASE_CONFIG_PRIVATE_KEY_ID, */
/*         private_key: process.env.FIREBASE_CONFIG_PRIVATE_KEY.replace(/\\n/g, '\n'), */
/*         client_email: process.env.FIREBASE_CONFIG_CLIENT_EMAIL, */
/*         client_id: process.env.FIREBASE_CONFIG_CLIENT_ID, */
/*         auth_uri: process.env.FIREBASE_CONFIG_AUTH_URI, */
/*         token_uri: process.env.FIREBASE_CONFIG_TOKEN_URI, */
/*         auth_provider_x509_cert_url: process.env.FIREBASE_CONFIG_AUTH_PROVIDER, */
/*         client_x509_cert_url: process.env.FIREBASE_CONFIG_TYPE_CLIENT_CERT */
/*         }, */
/*     }) */
/* }); */

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig.dev)
});


logger.info("conectados a firebase");

const db = admin.firestore();

class Container {
    constructor (collection) {
        this.collection = db.collection(collection);
        this.id = 1;
    }    

    async save(element) {
        try {
            const allItems = await this.collection.get(); 
            const docs = allItems.docs;
            const id = docs.length + 1;
            const idDoc = "" + id;
            try {
                const elementToSave = this.collection.doc(idDoc);
                await elementToSave.create(element);
                console.log("agregado exitoso", element.email);
                const allItemsNorm = await colMessages.getAll();
                return allItemsNorm;
            }
            catch (error) {
                console.log("el error al guardar fue: ", error);
            }
        }
        catch (error) {
            console.log("error en Save): ", error);
        }
    }

    async getAll() {
        try {
            const allItems = await this.collection.get();
            const docs = allItems.docs;
            const messages = docs.map((doc) => ({
                id : doc.id,
                author: doc.data().author,                
                date: doc.data().date,
                text: doc.data().text    
            }));
            const messagesNormalized = this.normalizer(messages);
            return messagesNormalized;
        }
        catch (error) {
            console.log("error en getAll): ", error);
            return [];
        }
    }

    async normalizer(messages) {
        const messagesToNorm = {
            id: 'mensajes',
            messages : messages
        };

        const authorSchema = new normalize.schema.Entity('authors', {}, {idAttribute: 'email'});
        const messageSchema = new normalize.schema.Entity('message', { 
            author: authorSchema
        });
        const messagesSchema = new normalize.schema.Entity('messages', {
            messages: [ messageSchema ]
        });
        const normalizedMessages = normalize.normalize(messagesToNorm, messagesSchema);
        //print(normalizedMessages);
        return normalizedMessages;
    }
}

const colMessages = new Container('messages');

module.exports = colMessages;

