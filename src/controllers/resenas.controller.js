const ResenasModel = require("../models/resenas.model");

/**
 * Obtener reseñas de un libro.
 *
 * Endpoint:
 * GET /api/libros/:id/resenas
 */
const getResenasByLibro = async (req, res) => {
    try {
        const { id } = req.params;

        const resenas = await ResenasModel.selectResenasByLibro(id);

        res.json({
            mensaje: "Reseñas encontradas",
            data: resenas,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener las reseñas",
        });
    }
};

module.exports = {
    getResenasByLibro,
};