const router = require('express').Router();
const contactoController = require('../../controllers/contacto.controller');

/**
 * Ruta pública.
 */
router.post('/contacto', contactoController.enviarMensajeContacto);

module.exports = router;