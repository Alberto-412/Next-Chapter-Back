const pool = require("../config/conexion");

// Listar todas las categorías
const selectAllCategorias = async () => {

    // Trae todas las categorías de la base de datos
    const sql = `
        SELECT 
            id,
            nombre,
            descripcion
        FROM categorias
    `;

    const [result] = await pool.query(sql);

    // Devuelve las categorías al controller
    return result;
};

// Función para buscar una categoría por su id
const selectCategoriaById = async (id) => {

    // Consulta para buscar una categoría concreta
    const sql = `
        SELECT
            id,
            nombre,
            descripcion
        FROM categorias
        WHERE id = ?
    `;

    // Ejecutamos la consulta pasando el id
    const [result] = await pool.query(sql, [id]);

    // Devolvemos solo la primera categoría encontrada
    return result[0];
};

// Crear una nueva categoría
const insertCategoria = async (categoria) => {

    // Sacamos los datos que llegan desde el body
    const { nombre, descripcion } = categoria;

    // Duarda la nueva categoría
    const sql = `
        INSERT INTO categorias
        (nombre, descripcion)
        VALUES (?, ?)
    `;

    // Envias los datos al servidor y obtenemos el resultado
    const [result] = await pool.query(sql, [
        nombre,
        descripcion
    ]);


    return result;
};

// Editar una categoría
const updateCategoria = async (id, categoria) => {

    // datos que llegan desde el body
    const { nombre, descripcion } = categoria;

    // se actualiza la categoría que tenga ese id
    const sql = `
        UPDATE categorias
        SET
            nombre = ?,
            descripcion = ?
        WHERE id = ?
    `;

    // Los ? se sustituyen por estos valores
    const [result] = await pool.query(sql, [
        nombre,
        descripcion,
        id
    ]);

    return result;
};

// Borrar una categoría por su id
const deleteCategoria = async (id) => {

    // Eliminas la categoría que tenga ese id
    const sql = `
        DELETE FROM categorias
        WHERE id = ?
    `;

    // Ejecutamos la consulta pasando el id como parámetro
    // y guardamos la respuesta de la base de datos en result.
    const [result] = await pool.query(sql, [id]);

    return result;
};

//RECUERDA EXPORTAAAAAAAAAAR
module.exports = {
    selectAllCategorias,
    selectCategoriaById,
    insertCategoria,
    updateCategoria,
    deleteCategoria
};