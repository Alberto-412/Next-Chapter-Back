const LibrosModel = require("../models/libros.model");

// Obtener todos los libros
// Obtiene los filtros enviados por query params en la URL.
// Ejemplo:
// GET /api/libros?busqueda=harry&categoria=2&precioMin=10&precioMax=30
// req.query contendrá esos valores y se envían al modelo.
const getAll = async (req, res) => {
    try {
        const libros = await LibrosModel.selectAllLibros(req.query);

        res.json({
            mensaje: "Libros encontrados",
            data: libros
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener los libros"
        });
    }
};


// Obtienes el detalle de un libro
const getById = async (req, res) => {

    try {

        // Capturas el id de la URL PARAMS Porque el id viene dentro de la URL
        const { id } = req.params;

        const libro = await LibrosModel.selectLibroById(id);

        // Si no existe
        if (!libro) {
            return res.status(404).json({
                mensaje: "Libro no encontrado"
            });
        }

        res.json({
            mensaje: "Libro encontrado",
            data: libro
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener el libro"
        });
    }
};

// Crear libro
const createLibro = async (req, res) => {
    try {
        const nuevoLibro = req.body;

        const result = await LibrosModel.insertLibro(nuevoLibro);

        res.status(201).json({
            mensaje: "Libro creado correctamente",
            id: result.insertId
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            mensaje: "Error al crear el libro"
        });
    }
};

module.exports = {
    getAll,
    getById,
    createLibro
};