const nodemailer = require('nodemailer');

const sendMail = (dataUser) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: 'mvszewczuk@gmail.com',
            pass: process.env.PW_GMAIL
        }
    });

    const mailOptions = {
        from: 'Backend <ms@coder.com>',
        to: process.env.GMAIL_USER,
        subject: "Nuevo registro",
        html: `<h1>Datos del nuevo registro:</h1>
            <p>nombre de usuario (email): ${dataUser.username}</p>
            <p>nombre y apellido: ${dataUser.name}</p>
            <p>dirección: ${dataUser.address}</p>
            <p>edad: ${dataUser.age}</p>
            <p>teléfono: ${dataUser.phone}</p>`,
        attachments: [
            {
                path: `../PF3B/public/avatars/${dataUser.username}.jpeg`
            }
        ]
    };
      
    transporter.sendMail(mailOptions)
    .then((result) => {
        console.log(result);
    }).catch (console.log);
};

module.exports = sendMail;
