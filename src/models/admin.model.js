/**
 * ========================================
 * MODELO DE ADMINISTRACIÓN
 * ========================================
 * Este archivo contiene todas las funciones para gestionar:
 * - Usuarios (validación, roles, permisos)
 * - Productos (CRUD completo)
 * - Pedidos (gestión de estado)
 * - Dashboard (estadísticas y reportes)
 * 
 * Cada función realiza operaciones en la base de datos
 * y retorna false si no hay resultados, o el resultado si la operación fue exitosa
 */

const pool = require("../config/conexion")

// ========== FUNCIONES DE USUARIOS ==========
// Estas funciones manejan la validación, roles y permisos de usuarios

/**
 * Valida un usuario (marca como validado = 1)
 * @param {number} id - ID del usuario a validar
 * @returns {object|boolean} - Resultado de la actualización o false si no existe el usuario
 */
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

// ========== FUNCIONES DE PRODUCTOS ==========
// Estas funciones manejan todo el CRUD de productos

/**
 * Obtiene todos los productos con sus detalles
 * @returns {array|boolean} - Array con todos los productos o false si no hay productos
 */
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

/**
 * Obtiene un producto específico por su ID con todos sus detalles
 * @param {number} id - ID del producto
 * @returns {object|boolean} - Objeto con los detalles del producto o false si no existe
 */
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

/**
 * Crea un nuevo producto en la base de datos
 * @param {string} titulo - Título del producto
 * @param {string} descripcion - Descripción del producto
 * @param {string} isbn - ISBN del libro
 * @param {number} precio - Precio del producto
 * @param {number} stock - Cantidad en stock
 * @param {number} pre_reserva - Cantidad disponible para pre-reserva
 * @param {string} imagen - URL de la imagen
 * @param {date} fecha_publicacion - Fecha de publicación
 * @param {number} id_editorial - ID de la editorial
 * @returns {object|boolean} - Resultado con insertId o false si no se pudo crear
 */
const createProduct = async (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial) => {
    const insert = `
        INSERT INTO productos (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await pool.query(insert, [titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial])
    if (result.affectedRows === 0) return false
    return result
}

/**
 * ========================================
 * ACTUALIZA UN PRODUCTO EXISTENTE
 * ========================================
 * FUNCIÓN IMPORTANTE: Esta era la función que faltaba en las exportaciones (module.exports)
 * Sin esta función exportada, el endpoint PUT /admin/products/:productId no funcionaba
 * 
 * @param {number} id - ID del producto a actualizar
 * @param {string} titulo - Nuevo título
 * @param {string} descripcion - Nueva descripción
 * @param {string} isbn - Nuevo ISBN
 * @param {number} precio - Nuevo precio
 * @param {number} stock - Nuevo stock
 * @param {number} pre_reserva - Nueva cantidad de pre-reserva
 * @param {string} imagen - Nueva URL de imagen
 * @param {string} fecha_publicacion - Nueva fecha de publicación (formato YYYY-MM-DD)
 * @param {number} id_editorial - Nuevo ID de editorial
 * @returns {object|boolean} - Resultado de la actualización o false si no existe el producto
 */
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

/**
 * Verifica si un producto tiene pedidos asociados
 * Se usa para evitar eliminar productos que ya fueron vendidos
 * @param {number} id - ID del producto
 * @returns {array} - Array de IDs de pedidos que contienen este producto
 */
const checkProductInPedidos = async (id) => {
    const select = "SELECT id_pedido FROM pedido_producto WHERE id_producto = ?"
    const [result] = await pool.query(select, [id])
    return result
}

/**
 * Elimina un producto de la base de datos
 * @param {number} id - ID del producto a eliminar
 * @returns {object|boolean} - Resultado de la eliminación o false si no existe
 */
const deleteProduct = async (id) => {
    const query = "DELETE FROM productos WHERE id = ?"
    const [result] = await pool.query(query, [id])
    if (result.affectedRows === 0) return false
    return result
}

/**
 * Actualiza las categorías asignadas a un producto
 * Elimina todas las categorías anteriores e inserta las nuevas
 * @param {number} id_producto - ID del producto
 * @param {array} categorias - Array de IDs de categorías
 * @returns {object|boolean} - Resultado de la operación o false si falla
 */
const updateProductCategories = async (id_producto, categorias) => {
    // Primero, eliminar todas las categorías anteriores
    const deleteQuery = "DELETE FROM producto_categoria WHERE id_producto = ?"
    await pool.query(deleteQuery, [id_producto])

    // Luego, insertar las nuevas categorías
    if (categorias && categorias.length > 0) {
        for (const id_categoria of categorias) {
            const insertQuery = "INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (?, ?)"
            await pool.query(insertQuery, [id_producto, id_categoria])
        }
    }

    return true
}

// ========== FUNCIONES DE PEDIDOS ==========
// Estas funciones manejan la gestión de pedidos y sus estados

/**
 * Obtiene todos los pedidos con información del cliente
 * @returns {array|boolean} - Array con todos los pedidos o false si no hay
 */
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

/**
 * Obtiene detalles completos de un pedido específico
 * Incluye información del cliente y productos del pedido
 * @param {number} id - ID del pedido
 * @returns {object|boolean} - Objeto con detalles del pedido o false si no existe
 */
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

/**
 * Actualiza el estado de un pedido
 * Estados válidos: pendiente, procesando, enviado, entregado, cancelado
 * @param {number} id - ID del pedido
 * @param {string} estado - Nuevo estado del pedido
 * @returns {object|boolean} - Resultado de la actualización o false si no existe
 */
const updateOrderStatus = async (id, estado) => {
    const update = "UPDATE pedidos SET estado = ? WHERE id = ?"
    const [result] = await pool.query(update, [estado, id])
    if (result.affectedRows === 0) return false
    return result
}

// ========== FUNCIONES DE GESTIÓN DE USUARIOS (ADMIN) ==========
// Estas funciones permiten editar y eliminar usuarios desde el panel admin

/**
 * Obtiene lista completa de todos los usuarios del sistema
 * @returns {array|boolean} - Array con todos los usuarios o false si no hay
 */
const getUsers = async () => {
    const select = "SELECT id, nombre, mail, telefono, direccion, rol, activo, validado, fecha_registro FROM usuarios"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

/**
 * Actualiza los datos de un usuario (nombre, contacto, dirección, rol)
 * @param {number} id - ID del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} mail - Email del usuario
 * @param {string} telefono - Teléfono del usuario
 * @param {string} direccion - Dirección del usuario
 * @param {string} rol - Rol del usuario (admin o cliente)
 * @param {number} activo - Estado activo (1) o inactivo (0)
 * @returns {object|boolean} - Resultado de la actualización o false si no existe
 */
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

/**
 * Marca un usuario como inactivo (baja lógica, no se elimina físicamente)
 * @param {number} id - ID del usuario a desactivar
 * @returns {object|boolean} - Resultado de la actualización o false si no existe
 */
const deleteUser = async (id) => {
    const update = "UPDATE usuarios SET activo = 0 WHERE id = ?"
    const [result] = await pool.query(update, [id])
    if (result.affectedRows === 0) return false
    return result
}

/**
 * Verifica si un usuario tiene pedidos activos
 * Se usa para evitar eliminar usuarios con pedidos en proceso
 * @param {number} id - ID del usuario
 * @returns {array} - Array de pedidos activos del usuario
 */
const checkUserActivePedidos = async (id) => {
    const select = "SELECT id FROM pedidos WHERE id_usuario = ? AND estado IN ('pendiente', 'procesando', 'enviado')"
    const [result] = await pool.query(select, [id])
    return result
}

// ========== FUNCIONES DE DASHBOARD ==========
// Estas funciones obtienen datos para visualización en el dashboard

/**
 * Obtiene datos consolidados para el dashboard de administración
 * Incluye: últimos pedidos, usuarios pendientes de validación, estadísticas
 * @returns {object} - Objeto con pedidos, usuariosPendientes y estadísticas
 */
const getDashboard = async () => {
    const selectPedidos = `
        SELECT p.id, p.total, p.estado, p.fecha_pedido, p.direccion_envio, p.metodo_pago,
               u.nombre AS cliente, u.mail
        FROM pedidos p
        JOIN usuarios u ON p.id_usuario = u.id
        ORDER BY p.fecha_pedido DESC
        LIMIT 10
    `
    const selectPendientes = "SELECT id, nombre, mail, fecha_registro FROM usuarios WHERE validado = 0"

    const selectStats = `
        SELECT 
            COUNT(*) AS total_pedidos,
            SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) AS entregados,
            SUM(CASE WHEN estado IN ('procesando', 'enviado') THEN 1 ELSE 0 END) AS en_proceso,
            SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) AS cancelados,
            SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END) AS ingresos_totales
        FROM pedidos
    `

    const [pedidos] = await pool.query(selectPedidos)
    const [pendientes] = await pool.query(selectPendientes)
    const [statsRows] = await pool.query(selectStats)

    return {
        pedidos,
        usuariosPendientes: pendientes,
        stats: statsRows[0]
    }
}

// ========== FUNCIONES DE LISTAS PARA FORMULARIOS ==========
// Estas funciones obtienen datos para rellenar selectores en formularios

/**
 * Obtiene todas las editoriales disponibles para asignar a productos
 * Se usa en los formularios de creación y edición de productos
 * @returns {array|boolean} - Array con id y nombre de editoriales o false si no hay
 */
const getEditoriales = async () => {
    const select = "SELECT id, nombre FROM editoriales ORDER BY nombre"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

// En admin.model.js, ANTES de module.exports, agrega:

/**
 * Busca el ID de una editorial por su nombre
 * @param {string} nombre - Nombre de la editorial
 * @returns {number|null} - ID de la editorial o null si no existe
 */
const getEditorialIdByNombre = async (nombre) => {
    const select = "SELECT id FROM editoriales WHERE nombre = ? LIMIT 1"
    const [result] = await pool.query(select, [nombre.trim()])
    if (result.length === 0) return null
    return result[0].id
}

/**
 * Busca los IDs de categorías por sus nombres
 * @param {array} nombres - Array de nombres de categorías
 * @returns {array} - Array de IDs de categorías encontradas
 */
const getCategoriaIdsByNombres = async (nombres) => {
    const categoriasIds = []
    for (const nombre of nombres) {
        const select = "SELECT id FROM categorias WHERE nombre = ? LIMIT 1"
        const [result] = await pool.query(select, [nombre.trim()])
        if (result.length > 0) {
            categoriasIds.push(result[0].id)
        }
    }
    return categoriasIds
}

/**
 * Obtiene todas las categorías disponibles para asignar a productos
 * Se usa en los formularios de creación y edición de productos
 * @returns {array|boolean} - Array con id y nombre de categorías o false si no hay
 */
const getCategorias = async () => {
    const select = "SELECT id, nombre FROM categorias ORDER BY nombre"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

// ========== EXPORTAR TODAS LAS FUNCIONES DEL MODELO ==========
// Importante: updateProduct, getEditoriales y getCategorias estaban faltando
module.exports = {
    // Funciones de Usuarios
    validarUsuario,
    getUsuariosPendientes,
    updateRol,
    getUsuarioById,

    // Funciones de Productos
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    checkProductInPedidos,
    deleteProduct,
    updateProductCategories,
    getEditorialIdByNombre,
    getCategoriaIdsByNombres,

    // Funciones de Pedidos
    getOrders,
    getOrderById,
    updateOrderStatus,

    // Funciones de Usuarios Admin
    getUsers,
    updateUser,
    deleteUser,
    checkUserActivePedidos,

    // Funciones del Dashboard y Listas
    getDashboard,
    getEditoriales,
    getCategorias
}