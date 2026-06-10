const router = require("express").Router();

const resenasControl = require("../../controllers/resenas.controller");

/**
 * Ruta pública.
 *
 * Ver reseñas de un libro.
 */
router.get("/libros/:id/resenas", resenasControl.getResenasByLibro);

module.exports = router;