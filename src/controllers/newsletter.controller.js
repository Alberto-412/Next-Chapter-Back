const NewsletterModel = require("../models/newsletter.model");

/**
 * Registrar email en newsletter
 */
const createNewsletter = async (req, res) => {

    try {

        const { mail } = req.body;

        if (!mail) {
            return res.status(400).json({
                mensaje: "Todo buen prólogo empieza con un email."
            });
        }

        const result = await NewsletterModel.insertMail(mail);

        res.status(201).json({
            mensaje: "Tu sitio en la primera fila de esta historia ya está reservado.",
            id: result.insertId
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Hemos perdido el hilo de la trama. Inténtalo de nuevo."
        });
    }
};

module.exports = {
    createNewsletter
};