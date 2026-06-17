const pool = require("../config/conexion")


const selectByEmail = async (mail) => {
    const select = "SELECT id, nombre, mail, contraseña, rol, validado FROM usuarios WHERE mail = ?"
    const [result] = await pool.query(select, [mail])
    if (result.length === 0) return false
    return result
}

const getUserById = async (id) => {
    const select = "SELECT id, nombre, mail, contraseña, rol FROM usuarios WHERE id = ?"
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

const addUser = async (nombre, mail, contraseña) => {
    const insert = "INSERT INTO usuarios (nombre, mail, contraseña, rol) VALUES (?, ?, ?, ?)"
    const [result] = await pool.query(insert, [nombre, mail, contraseña, 'cliente'])
    if (result.affectedRows === 0) {
        return false
    }
    return result
}

const getPedidosActivos = async (id) => {
    const select = "SELECT id FROM pedidos WHERE id_usuario = ? AND estado IN ('pendiente', 'procesando', 'enviado')"
    const [result] = await pool.query(select, [id])
    return result  // devuelve array vacío [] si no hay pedidos, no hace falta el if
}



const getProfile = async (id) => {
    const select = "SELECT id, nombre, mail, rol FROM usuarios WHERE id = ?"
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

const updateProfile = async (id, nombre, mail) => {
    const update = "UPDATE usuarios SET nombre = ?, mail = ? WHERE id = ?"
    const [result] = await pool.query(update, [nombre, mail, id])
    if (result.affectedRows === 0) return false
    return result
}

const updatePassword = async (id, contraseña) => {
    const update = "UPDATE usuarios SET contraseña = ? WHERE id = ?"
    const [result] = await pool.query(update, [contraseña, id])
    if (result.affectedRows === 0) return false
    return result
}

const deleteUser = async (id) => {
    const query = "UPDATE usuarios SET activo = 0 WHERE id = ?"
    const [result] = await pool.query(query, [id])
    if (result.affectedRows === 0) return false
    return result
}


const getWishlist = async (usuario_id) => {
    // JOIN con productos para traer también titulo, precio e imagen,
    // porque la tabla favoritos solo guarda los IDs y wishlist.html pinta esos campos.
    const select = `
        SELECT
            f.libro_id,
            p.titulo,
            p.precio,
            p.imagen
        FROM favoritos f
        JOIN productos p ON f.libro_id = p.id
        WHERE f.usuario_id = ?
    `;
    const [result] = await pool.query(select, [usuario_id]);
    // Devolvemos el array tal cual. Si está vacío es [] (no un error):
    // así el controller responde 200 [] y el front muestra "No tienes libros…"
    return result;
};

const addToWishlist = async (usuario_id, libro_id) => {
    const insert = "INSERT INTO favoritos (usuario_id, libro_id) VALUES (?, ?)"
    const [result] = await pool.query(insert, [usuario_id, libro_id])
    if (result.affectedRows === 0) return false
    return result
}

const removeFromWishlist = async (usuario_id, libro_id) => {
    const query = "DELETE FROM favoritos WHERE usuario_id = ? AND libro_id = ?"
    const [result] = await pool.query(query, [usuario_id, libro_id])
    if (result.affectedRows === 0) return false
    return result
}

const getReviews = async (usuario_id) => {
    const select = "SELECT * FROM resenas WHERE id_usuario = ?"
    const [result] = await pool.query(select, [usuario_id])
    if (result.length === 0) return false
    return result
}

const addReview = async (usuario_id, producto_id, calificacion, comentario) => {
    const insert = "INSERT INTO resenas (id_usuario, id_producto, calificacion, comentario) VALUES (?, ?, ?, ?)"
    const [result] = await pool.query(insert, [usuario_id, producto_id, calificacion, comentario])
    if (result.affectedRows === 0) return false
    return result
}

const updateReview = async (id_review, usuario_id, calificacion, comentario) => {
    const update = "UPDATE resenas SET calificacion = ?, comentario = ? WHERE id = ? AND id_usuario = ?"
    const [result] = await pool.query(update, [calificacion, comentario, id_review, usuario_id])
    if (result.affectedRows === 0) return false
    return result
}

const deleteReview = async (id_review, usuario_id) => {
    const query = "DELETE FROM resenas WHERE id = ? AND id_usuario = ?"
    const [result] = await pool.query(query, [id_review, usuario_id])
    if (result.affectedRows === 0) return false
    return result
}

module.exports = { selectByEmail, getUserById, getPedidosActivos, addUser, getProfile, updateProfile, updatePassword, deleteUser, getWishlist, addToWishlist, removeFromWishlist, getReviews, addReview, updateReview, deleteReview }