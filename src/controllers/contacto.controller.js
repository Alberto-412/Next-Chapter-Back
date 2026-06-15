const transporter = require('../utils/mailer');

/**
 * Este controller recibe los datos del formulario de contacto
 * y manda un correo al email de la librería.
 */
const enviarMensajeContacto = async (req, res) => {
    try {
        const { nombre, email, asunto, mensaje } = req.body;

        if (!nombre || !email || !asunto || !mensaje) {
            return res.status(400).json({
                mensaje: 'Te falta rellenar algún campo del pergamino.',
            });
        }

        // Email que recibe NextChapter
        await transporter.sendMail({
            from: process.env.GOOGLE_EMAIL,
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: `NextChapter contacto: ${asunto}`,
            html: `
        <h2>Nuevo mensaje desde NextChapter</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
        });

        // Respuesta automática al usuario
        await transporter.sendMail({
            from: process.env.GOOGLE_EMAIL,
            to: email,
            subject: 'Tu mensaje ha llegado a NextChapter',
            html: `
        <h2>Mensaje recibido</h2>
        <p>Hola ${nombre},</p>
        <p>Tu mensaje ha entrado en nuestra estantería mágica.</p>
        <p>Te responderemos lo antes posible.</p>
        <p><strong>NextChapter Ediciones</strong></p>
      `,
        });

        res.json({
            mensaje: 'Mensaje enviado correctamente. ¡Búho mensajero desplegado!',
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: 'El búho mensajero se ha perdido. Inténtalo otra vez.',
        });
    }
};

module.exports = {
    enviarMensajeContacto,
};