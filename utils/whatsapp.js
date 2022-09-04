const twilio = require('twilio');
const logger = require('./loggers/winston');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const sendWhatsapp = (dataUser) => {
    client.messages.create({
        body: `Nuevo pedido de ${dataUser.name}, email: ${dataUser.username}`,
        from:  'whatsapp:+14155238886',
        to: `whatsapp:${process.env.WHATSAPP_NUMBER}`
    }).then((data) => {
        logger.info('Mensaje enviado correctamente al administrador');
    }). catch(console.log);

    client.messages.create({
        body: `Mis productos(Backend) - Su pedido fue recibido y se encuentra en proceso`,
        from:  'whatsapp:+14155238886',
        to: `whatsapp:${dataUser.phone}`
    }).then((data) => {
        logger.info('Mensaje enviado correctamente al cliente');
    }). catch(console.log);

}

module.exports = sendWhatsapp;