const CategoriasModel = require("../models/categorias.model");

// Obtener todas las categorías
const getAllCategorias = async (req, res) => {

    try {

        // Pides al modelo todas las categorías
        const categorias = await CategoriasModel.selectAllCategorias();

        res.json({
            mensaje: "Categorías encontradas",
            data: categorias
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener las categorías"
        });
    }
};

// Mostrar una categoría por su id
const getById = async (req, res) => {

    try {

        // Sacas el id de la URL
        const { id } = req.params;

        // Buscas la categoría usando ese id
        const categoria = await CategoriasModel.selectCategoriaById(id);

        // Si no existe devolvemos un mensaje
        if (!categoria) {
            return res.status(404).json({
                mensaje: "Categoría no encontrada"
            });
        }

        // Envias la categoría encontrada
        res.json({
            mensaje: "Categoría encontrada",
            data: categoria
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al obtener la categoría"
        });
    }
};

// Crear una nueva categoría
const createCategoria = async (req, res) => {

    try {

        // Guardas los datos que llegan desde el body
        const nuevaCategoria = req.body;

        // creas la categoría
        const result = await CategoriasModel.insertCategoria(nuevaCategoria);

        // insertId contiene el id que la base de datos le ha asignado
        res.status(201).json({
            mensaje: "Categoría creada correctamente",
            id: result.insertId
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al crear la categoría"
        });
    }
};

// Editar una categoría
const updateById = async (req, res) => {

    try {

        // Usamos params porque el id viene en la URL
        // Lo necesitamos para saber qué categoría editar
        const { id } = req.params;

        // Mandas al modelo el id y los datos nuevos
        const result = await CategoriasModel.updateCategoria(id, req.body);

        res.json({
            mensaje: "Categoría actualizada correctamente",
            data: result
        });

    } catch (error) {

        console.log(error);


        res.status(500).json({
            mensaje: "Error al actualizar la categoría"
        });
    }
};


// Borrar una categoría
const deleteById = async (req, res) => {

    try {

        // Usamos params porque el id viene en la URL
        // Lo necesitamos para saber qué categoría queremos borrar
        const { id } = req.params;

        const result = await CategoriasModel.deleteCategoria(id);

        res.json({
            mensaje: "Categoría eliminada correctamente",
            data: result
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al eliminar la categoría"
        });
    }
};

module.exports = {
    getAllCategorias,
    getById,
    createCategoria,
    updateById,
    deleteById
};