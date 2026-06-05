const EditorialesModel = require("../models/editorial.model");

// Obtener todas las editoriales
const getAllEditoriales = async (req, res) => {

    try {

        // Buscar editoriales
        const editoriales = await EditorialesModel.selectAllEditoriales();

        // Enviar respuesta
        res.json({
            mensaje: "Editoriales encontradas",
            data: editoriales
        });

    } catch (error) {

        console.log(error);

        // Error del servidor
        res.status(500).json({
            mensaje: "Error al obtener las editoriales"
        });
    }
};

// Obtener una editorial por id
const getById = async (req, res) => {

    try {

        // Obtener el id de la URL
        const { id } = req.params;

        // Buscar la editorial usando ese id
        const editorial = await EditorialesModel.selectEditorialById(id);

        // Comprobar si existe
        if (!editorial) {
            return res.status(404).json({
                mensaje: "Editorial no encontrada"
            });
        }


        res.json({
            mensaje: "Editorial encontrada",
            data: editorial
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al obtener la editorial"
        });
    }
};

// Crear editorial
const createEditorial = async (req, res) => {

    try {

        // Obtener los datos del body
        const nuevaEditorial = req.body;

        // Crear la editorial
        const result = await EditorialesModel.insertEditorial(nuevaEditorial);

        res.status(201).json({
            mensaje: "Editorial creada correctamente",
            id: result.insertId
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al crear la editorial"
        });
    }
};

// Editar editorial
const updateById = async (req, res) => {

    try {

        // Obtener el id de la URL
        const { id } = req.params;

        // Actualizar la editorial con los datos nuevos
        const result = await EditorialesModel.updateEditorial(id, req.body);


        res.json({
            mensaje: "Editorial actualizada correctamente",
            data: result
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al actualizar la editorial"
        });
    }
};

// Borrar editorial
const deleteById = async (req, res) => {

    try {

        // Obtener el id de la URL
        const { id } = req.params;

        // Borrar la editorial usando ese id
        const result = await EditorialesModel.deleteEditorial(id);


        res.json({
            mensaje: "Editorial eliminada correctamente",
            data: result
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al eliminar la editorial"
        });
    }
};

module.exports = {
    getAllEditoriales,
    getById,
    createEditorial,
    updateById,
    deleteById
};