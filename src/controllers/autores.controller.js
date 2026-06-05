const AutoresModel = require("../models/autores.model");

// Mostrar todos los autores
const getAllAutores = async (req, res) => {

    try {

        // Llamo al modelo para traer todos los autores
        const autores = await AutoresModel.selectAllAutores();


        res.json({
            mensaje: "Autores encontrados",
            data: autores
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al obtener los autores"
        });
    }
};

// Obtener un autor por id
const getById = async (req, res) => {

    try {

        // Obtener el id de la URL
        const { id } = req.params;

        // Buscar el autor usando ese id
        const autor = await AutoresModel.selectAutorById(id);

        // Comprobar si existe
        if (!autor) {
            return res.status(404).json({
                mensaje: "Autor no encontrado"
            });
        }


        res.json({
            mensaje: "Autor encontrado",
            data: autor
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al obtener el autor"
        });
    }
};

// Crear autor
const createAutor = async (req, res) => {

    try {

        // Datos que llegan desde el body
        const nuevoAutor = req.body;

        // Crear autor en la base de datos
        const result = await AutoresModel.insertAutor(nuevoAutor);


        res.status(201).json({
            mensaje: "Autor creado correctamente",
            id: result.insertId
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al crear el autor"
        });
    }
};

// Editar autor
const updateById = async (req, res) => {

    try {

        // Obtener el id de la URL
        const { id } = req.params;

        // Actualizar el autor con los datos nuevos
        const result = await AutoresModel.updateAutor(id, req.body);


        res.json({
            mensaje: "Autor actualizado correctamente",
            data: result
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al actualizar el autor"
        });
    }
};

// Borrar autor
const deleteById = async (req, res) => {

    try {

        // Obtener el id de la URL
        const { id } = req.params;

        // Borrar el autor usando ese id
        const result = await AutoresModel.deleteAutor(id);


        res.json({
            mensaje: "Autor eliminado correctamente",
            data: result
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al eliminar el autor"
        });
    }
};

module.exports = {
    getAllAutores,
    getById,
    createAutor,
    updateById,
    deleteById
};