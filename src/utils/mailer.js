const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Configuro Nodemailer con Gmail.
 * Uso variables de entorno para no poner la contraseña en el código.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});


module.exports = transporter;