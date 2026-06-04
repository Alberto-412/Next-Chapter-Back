const pool = require("../config/conexion")


const validarUsuario = async (id) => {
    const update = "UPDATE usuarios SET validado = 1 WHERE id = ?"
    const [result] = await pool.query(update, [id])
    if (result.affectedRows === 0) return false
    return result
}

const getUsuariosPendientes = async () => {
    const select = "SELECT id, nombre, mail, rol, fecha_registro FROM usuarios WHERE validado = 0"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

const updateRol = async (id, rol) => {
    const update = "UPDATE usuarios SET rol = ? WHERE id = ?"
    const [result] = await pool.query(update, [rol, id])
    if (result.affectedRows === 0) return false
    return result
}

const getUsuarioById = async (id) => {
    const select = "SELECT id, nombre, mail, rol, activo, validado, fecha_registro FROM usuarios WHERE id = ?"
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

module.exports = { validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById }
