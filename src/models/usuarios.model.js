const pool = require("../config/conexion")


const selectByEmail = async (mail) => {
    const select = "SELECT id, mail, rol, contraseña FROM usuarios WHERE mail = ?"
    const [result] = await pool.query(select, [mail])      // El select siempre devuelve un array

    if (result.length === 0) {
        return false
    }
    return result // es un array []
}

const addUser = async (nombre, mail, contraseña) => {
    const insert = "INSERT INTO usuarios (nombre, mail, contraseña, rol) VALUES (?, ?, ?, ?)"
    const [result] = await pool.query(insert, [nombre, mail, contraseña, 'cliente'])
    if (result.affectedRows === 0) {
        return false
    }
    return result
}

const getProfile = async (id) => {
    const select = "SELECT id, nombre, mail, rol FROM usuarios WHERE id = ?"
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

const deleteUser = async (id) => {
    const query = "DELETE FROM usuarios WHERE id = ?"
    const [result] = await pool.query(query, [id])
    if (result.affectedRows === 0) return false
    return result
}


module.exports = { selectByEmail, addUser, getProfile, deleteUser }