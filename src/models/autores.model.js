const pool = require("../config/conexion");

// Función para sacar todos los autores
const selectAllAutores = async () => {

    // Busca todos los autores que hay guardados
    const sql = `
        SELECT
            id,
            nombre_autor,
            biografia
        FROM autores
    `;

    // Guardo el resultado de la consulta
    const [result] = await pool.query(sql);


    return result;
};

// Buscar un autor por id
const selectAutorById = async (id) => {

    // Buscar el autor que tenga ese id
    const sql = `
        SELECT
            id,
            nombre_autor,
            biografia
        FROM autores
        WHERE id = ?
    `;

    // Guardar el resultado
    const [result] = await pool.query(sql, [id]);

    // Devolver el primer resultado encontrado
    return result[0];
};

// Crear un autor
const insertAutor = async (autor) => {

    // Sacar los datos del body
    const { nombre_autor, biografia } = autor;

    // Guardar el autor en la tabla autores
    const sql = `
        INSERT INTO autores
        (nombre_autor, biografia)
        VALUES (?, ?)
    `;

    // Pasar los valores a los ?
    const [result] = await pool.query(sql, [
        nombre_autor,
        biografia
    ]);


    return result;
};

// Editar un autor
const updateAutor = async (id, autor) => {

    // Sacar los datos nuevos del body
    const { nombre_autor, biografia } = autor;

    // Actualizar el autor que tenga ese id
    const sql = `
        UPDATE autores
        SET
            nombre_autor = ?,
            biografia = ?
        WHERE id = ?
    `;

    // Pasar los valores a los ?
    const [result] = await pool.query(sql, [
        nombre_autor,
        biografia,
        id
    ]);


    return result;
};

// Borrar un autor
const deleteAutor = async (id) => {

    // Borrar el autor que tenga ese id
    const sql = `
        DELETE FROM autores
        WHERE id = ?
    `;


    const [result] = await pool.query(sql, [id]);


    return result;
};

module.exports = {
    selectAllAutores,
    selectAutorById,
    insertAutor,
    updateAutor,
    deleteAutor
};