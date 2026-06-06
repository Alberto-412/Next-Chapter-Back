const pool = require("../config/conexion")

// --- USUARIOS ---

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
    const select = "SELECT id, nombre, mail, telefono, direccion, rol, activo, validado, fecha_registro FROM usuarios WHERE id = ?"
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

// --- PRODUCTOS ---

const getProducts = async () => {
    const select = `
        SELECT p.*, e.nombre AS editorial,
               GROUP_CONCAT(DISTINCT a.nombre_autor) AS autores,
               GROUP_CONCAT(DISTINCT c.nombre) AS categorias
        FROM productos p
        LEFT JOIN editoriales e ON p.id_editorial = e.id
        LEFT JOIN producto_autor pa ON p.id = pa.id_producto
        LEFT JOIN autores a ON pa.id_autor = a.id
        LEFT JOIN producto_categoria pc ON p.id = pc.id_producto
        LEFT JOIN categorias c ON pc.id_categoria = c.id
        GROUP BY p.id
    `
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

const getProductById = async (id) => {
    const select = `
        SELECT p.*, e.nombre AS editorial,
               GROUP_CONCAT(DISTINCT a.nombre_autor) AS autores,
               GROUP_CONCAT(DISTINCT c.nombre) AS categorias
        FROM productos p
        LEFT JOIN editoriales e ON p.id_editorial = e.id
        LEFT JOIN producto_autor pa ON p.id = pa.id_producto
        LEFT JOIN autores a ON pa.id_autor = a.id
        LEFT JOIN producto_categoria pc ON p.id = pc.id_producto
        LEFT JOIN categorias c ON pc.id_categoria = c.id
        WHERE p.id = ?
        GROUP BY p.id
    `
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

const createProduct = async (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial) => {
    const insert = `
        INSERT INTO productos (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await pool.query(insert, [titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial])
    if (result.affectedRows === 0) return false
    return result
}

const updateProduct = async (id, titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial) => {
    const update = `
        UPDATE productos
        SET titulo = ?, descripcion = ?, isbn = ?, precio = ?, stock = ?,
            pre_reserva = ?, imagen = ?, fecha_publicacion = ?, id_editorial = ?
        WHERE id = ?
    `
    const [result] = await pool.query(update, [titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial, id])
    if (result.affectedRows === 0) return false
    return result
}

const checkProductInPedidos = async (id) => {
    const select = "SELECT id_pedido FROM pedido_producto WHERE id_producto = ?"
    const [result] = await pool.query(select, [id])
    return result
}

const deleteProduct = async (id) => {
    const query = "DELETE FROM productos WHERE id = ?"
    const [result] = await pool.query(query, [id])
    if (result.affectedRows === 0) return false
    return result
}

const getOrders = async () => {
    const select = `
        SELECT p.*, u.nombre AS cliente, u.mail
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id
        ORDER BY p.fecha_pedido DESC
    `
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

const getOrderById = async (id) => {
    const select = `
        SELECT p.id, p.total, p.estado, p.fecha_pedido, p.direccion_envio, p.metodo_pago,
               u.nombre AS cliente, u.mail, u.telefono,
               pp.cantidad, pp.precio_unidad,
               pr.id AS id_producto, pr.titulo, pr.imagen
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id
        JOIN pedido_producto pp ON p.id = pp.id_pedido
        JOIN productos pr ON pp.id_producto = pr.id
        WHERE p.id = ?
    `
    const [rows] = await pool.query(select, [id])
    if (rows.length === 0) return false

    const pedido = {
        id: rows[0].id,
        total: rows[0].total,
        estado: rows[0].estado,
        fecha_pedido: rows[0].fecha_pedido,
        direccion_envio: rows[0].direccion_envio,
        metodo_pago: rows[0].metodo_pago,
        cliente: rows[0].cliente,
        mail: rows[0].mail,
        telefono: rows[0].telefono,
        productos: rows.map(row => ({
            id_producto: row.id_producto,
            titulo: row.titulo,
            imagen: row.imagen,
            cantidad: row.cantidad,
            precio_unidad: row.precio_unidad
        }))
    }
    return pedido
}

const updateOrderStatus = async (id, estado) => {
    const update = "UPDATE pedidos SET estado = ? WHERE id = ?"
    const [result] = await pool.query(update, [estado, id])
    if (result.affectedRows === 0) return false
    return result
}

const getUsers = async () => {
    const select = "SELECT id, nombre, mail, telefono, direccion, rol, activo, validado, fecha_registro FROM usuarios"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

const updateUser = async (id, nombre, mail, telefono, direccion, rol, activo) => {
    const update = `
        UPDATE usuarios 
        SET nombre = ?, mail = ?, telefono = ?, direccion = ?, rol = ?, activo = ?
        WHERE id = ?
    `
    const [result] = await pool.query(update, [nombre, mail, telefono, direccion, rol, activo, id])
    if (result.affectedRows === 0) return false
    return result
}

const deleteUser = async (id) => {
    const update = "UPDATE usuarios SET activo = 0 WHERE id = ?"
    const [result] = await pool.query(update, [id])
    if (result.affectedRows === 0) return false
    return result
}

const checkUserActivePedidos = async (id) => {
    const select = "SELECT id FROM pedidos WHERE id_usuario = ? AND estado IN ('pendiente', 'procesando', 'enviado')"
    const [result] = await pool.query(select, [id])
    return result
}

const getDashboard = async () => {
    const selectPedidos = `
        SELECT p.*, u.nombre AS cliente, u.mail
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id
        ORDER BY p.fecha_pedido DESC
    `
    const selectPendientes = "SELECT id, nombre, mail, fecha_registro FROM usuarios WHERE validado = 0"

    const [pedidos] = await pool.query(selectPedidos)
    const [pendientes] = await pool.query(selectPendientes)

    return { pedidos, usuariosPendientes: pendientes }
}

module.exports = { validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById, getProducts, getProductById, createProduct, updateProduct, checkProductInPedidos, deleteProduct, getOrders, getOrderById, updateOrderStatus, getUsers, updateUser, deleteUser, checkUserActivePedidos, getDashboard }
