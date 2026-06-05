const pool = require("../config/conexion");

// Sacar todas las editoriales
const selectAllEditoriales = async () => {

    // Buscar editoriales en la tabla editoriales
    const sql = `
        SELECT
            id,
            nombre
        FROM editoriales
    `;

    // Guardar lo que devuelve MySQL
    const [result] = await pool.query(sql);

    // Devolver editoriales encontradas
    return result;
};

// Buscar una editorial por id
const selectEditorialById = async (id) => {

    // Buscar la editorial que tenga ese id
    const sql = `
        SELECT
            id,
            nombre
        FROM editoriales
        WHERE id = ?
    `;


    const [result] = await pool.query(sql, [id]);


    return result[0];
};

// Crear una editorial
const insertEditorial = async (editorial) => {

    // Sacar el nombre que llega desde el body
    const { nombre } = editorial;

    // Guardar la editorial en la base de datos
    const sql = `
        INSERT INTO editoriales
        (nombre)
        VALUES (?)
    `;

    // Pasar el valor al ?
    const [result] = await pool.query(sql, [nombre]);


    return result;
};

// Editar una editorial
const updateEditorial = async (id, editorial) => {

    // Sacar el nombre nuevo del body
    const { nombre } = editorial;

    // Actualizar la editorial que tenga ese id
    const sql = `
        UPDATE editoriales
        SET
            nombre = ?
        WHERE id = ?
    `;

    // Pasar los valores a los ?
    const [result] = await pool.query(sql, [
        nombre,
        id
    ]);


    return result;
};

// Borrar una editorial
const deleteEditorial = async (id) => {

    // Borrar la editorial que tenga ese id
    const sql = `
        DELETE FROM editoriales
        WHERE id = ?
    `;


    const [result] = await pool.query(sql, [id]);


    return result;
};

module.exports = {
    selectAllEditoriales,
    selectEditorialById,
    insertEditorial,
    updateEditorial,
    deleteEditorial
};