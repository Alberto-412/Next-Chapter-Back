// ============================================================
// ARCHIVO: admin.model.js
// QUÉ HACE: Ejecuta las queries SQL contra la base de datos.
//           Es la única capa que "habla" con MySQL.
//           El controlador nunca escribe SQL; el modelo nunca
//           toca req ni res.
//
// PATRÓN COMÚN DE CADA FUNCIÓN:
//   · await pool.query(sql, [params]) → devuelve [rows, fields].
//     Solo usamos rows, por eso desestructuramos: const [result] = ...
//   · affectedRows === 0 → el WHERE no encontró ningún registro → false.
//   · result.length === 0 → el SELECT no devolvió filas → false.
//   · El controlador interpreta false como 404.
//
// PARÁMETROS con ? (prepared statements):
//   pool.query("SELECT * FROM t WHERE id = ?", [id])
//   MySQL sustituye cada ? por el valor del array EN ORDEN.
//   Esto evita SQL injection porque los valores se escapan automáticamente.
// ============================================================

const pool = require("../config/conexion")
// ↑ pool es una instancia de mysql2 con .promise() activado,
//   así que todas las queries devuelven Promises y podemos usar await.


// ── BLOQUE 1: USUARIOS ───────────────────────────────────────

// Aprueba la cuenta de un usuario: pone validado = 1.
// affectedRows === 0 → el ID no existía → devuelve false.
const validarUsuario = async (id) => {
    const update = "UPDATE usuarios SET validado = 1 WHERE id = ?"
    const [result] = await pool.query(update, [id])
    if (result.affectedRows === 0) return false
    return result
}

// Devuelve los usuarios con validado = 0 para el panel de aprobación.
// Si no hay ninguno devuelve false (el controlador responde 404).
const getUsuariosPendientes = async () => {
    const select = "SELECT id, nombre, mail, rol, fecha_registro FROM usuarios WHERE validado = 0"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

// Cambia el rol de un usuario. El controlador ya validó que sea 'admin' o 'cliente'.
const updateRol = async (id, rol) => {
    const update = "UPDATE usuarios SET rol = ? WHERE id = ?"
    const [result] = await pool.query(update, [rol, id])
    if (result.affectedRows === 0) return false
    return result
}

// Devuelve los datos de un usuario. NO incluye la contraseña en el SELECT
// (buena práctica: nunca devolver el hash aunque esté cifrado).
// result[0] → devolvemos el objeto, no el array de una fila.
const getUsuarioById = async (id) => {
    const select = "SELECT id, nombre, mail, telefono, direccion, rol, activo, validado, fecha_registro FROM usuarios WHERE id = ?"
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

// Lista todos los usuarios. Misma SELECT que getUsuarioById pero sin WHERE.
const getUsers = async () => {
    const select = "SELECT id, nombre, mail, telefono, direccion, rol, activo, validado, fecha_registro FROM usuarios"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

// Actualiza los campos editables de un usuario desde el panel admin.
// El ID va AL FINAL del array de parámetros porque en el SQL el WHERE id = ?
// es el último ? de la query.
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

// Baja lógica: pone activo = 0. No usa DELETE para conservar el historial
// de pedidos y datos de facturación (requisito del proyecto).
const deleteUser = async (id) => {
    const update = "UPDATE usuarios SET activo = 0 WHERE id = ?"
    const [result] = await pool.query(update, [id])
    if (result.affectedRows === 0) return false
    return result
}

// Comprueba si el usuario tiene pedidos en estados que impiden la baja.
// Devuelve el array tal cual (vacío = sin pedidos activos, con elementos = bloqueado).
const checkUserActivePedidos = async (id) => {
    const select = "SELECT id FROM pedidos WHERE id_usuario = ? AND estado IN ('pendiente', 'procesando', 'enviado')"
    const [result] = await pool.query(select, [id])
    return result
}


// ── BLOQUE 2: PRODUCTOS ──────────────────────────────────────

// Lista todos los productos con sus relaciones resueltas.
// LEFT JOIN → si un producto no tiene autor o categoría, igual aparece en el resultado.
// GROUP_CONCAT → agrupa varios valores de una columna en un string separado por comas.
//   Ej: categorías de un libro: "Ficción,Thriller" en lugar de dos filas.
// GROUP BY p.id → necesario cuando se usa GROUP_CONCAT para que cada producto
//   aparezca una sola vez.
// DISTINCT dentro de GROUP_CONCAT → evita duplicados si hay relaciones repetidas.
const getProducts = async () => {
    const select = `
        SELECT p.*, e.nombre AS editorial,
               GROUP_CONCAT(DISTINCT a.nombre_autor) AS autores,
               GROUP_CONCAT(DISTINCT c.nombre)       AS categorias
        FROM productos p
        LEFT JOIN editoriales e        ON p.id_editorial = e.id
        LEFT JOIN producto_autor pa    ON p.id = pa.id_producto
        LEFT JOIN autores a            ON pa.id_autor = a.id
        LEFT JOIN producto_categoria pc ON p.id = pc.id_producto
        LEFT JOIN categorias c          ON pc.id_categoria = c.id
        GROUP BY p.id
    `
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

// Mismo JOIN que getProducts pero con WHERE p.id = ? para un solo producto.
// result[0] → devolvemos el objeto, no el array.
const getProductById = async (id) => {
    const select = `
        SELECT p.*, e.nombre AS editorial,
               GROUP_CONCAT(DISTINCT a.nombre_autor) AS autores,
               GROUP_CONCAT(DISTINCT c.nombre)       AS categorias
        FROM productos p
        LEFT JOIN editoriales e        ON p.id_editorial = e.id
        LEFT JOIN producto_autor pa    ON p.id = pa.id_producto
        LEFT JOIN autores a            ON pa.id_autor = a.id
        LEFT JOIN producto_categoria pc ON p.id = pc.id_producto
        LEFT JOIN categorias c          ON pc.id_categoria = c.id
        WHERE p.id = ?
        GROUP BY p.id
    `
    const [result] = await pool.query(select, [id])
    if (result.length === 0) return false
    return result[0]
}

// Inserta un producto nuevo.
// result.insertId → ID autogenerado por MySQL para el nuevo registro.
// El controlador lo devuelve al frontend para que pueda navegar al nuevo producto.
const createProduct = async (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial) => {
    const insert = `
        INSERT INTO productos (titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await pool.query(insert, [titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial])
    if (result.affectedRows === 0) return false
    return result
}

// Actualiza todos los campos de un producto.
// El controlador ya convirtió la fecha a YYYY-MM-DD y resolvió el nombre
// de editorial a ID antes de llamar a esta función.
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

// Comprueba si el producto aparece en pedidos (tabla pedido_producto).
// El controlador usa este resultado para impedir el borrado si hay pedidos.
const checkProductInPedidos = async (id) => {
    const select = "SELECT id_pedido FROM pedido_producto WHERE id_producto = ?"
    const [result] = await pool.query(select, [id])
    return result
}

// Elimina el producto definitivamente (DELETE físico, no lógico).
// Solo se llega aquí si checkProductInPedidos devolvió vacío.
const deleteProduct = async (id) => {
    const query = "DELETE FROM productos WHERE id = ?"
    const [result] = await pool.query(query, [id])
    if (result.affectedRows === 0) return false
    return result
}

// Actualiza las categorías de un producto en la tabla intermedia producto_categoria.
// ESTRATEGIA: borrar todo y volver a insertar.
// Es más sencillo que comparar cuáles añadir y cuáles quitar.
// Se llama siempre después de updateProduct.
const updateProductCategories = async (id_producto, categorias) => {
    const deleteQuery = "DELETE FROM producto_categoria WHERE id_producto = ?"
    await pool.query(deleteQuery, [id_producto])

    if (categorias && categorias.length > 0) {
        for (const id_categoria of categorias) {
            const insertQuery = "INSERT INTO producto_categoria (id_producto, id_categoria) VALUES (?, ?)"
            await pool.query(insertQuery, [id_producto, id_categoria])
        }
    }
    return true
}


// ── BLOQUE 3: RESOLUCIÓN NOMBRE → ID ────────────────────────
// El frontend trabaja con nombres (más legibles).
// La base de datos guarda IDs (por integridad referencial).
// Estas dos funciones hacen la traducción en el controlador.

// Busca el ID de una editorial por nombre exacto.
// LIMIT 1 → aunque hubiera duplicados (no debería), devuelve uno solo.
// Devuelve null si no existe, para que el controlador lo pase como NULL al UPDATE.
const getEditorialIdByNombre = async (nombre) => {
    const select = "SELECT id FROM editoriales WHERE nombre = ? LIMIT 1"
    const [result] = await pool.query(select, [nombre.trim()])
    if (result.length === 0) return null
    return result[0].id
}

// Busca los IDs de un array de nombres de categorías.
// Hace una query por categoría (loop). Con muchas categorías se podría
// optimizar con un IN (?), pero para el volumen de este proyecto es suficiente.
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


// ── BLOQUE 4: PEDIDOS ────────────────────────────────────────

// Lista todos los pedidos con nombre y email del cliente (JOIN usuarios).
// ORDER BY fecha_pedido DESC → los más recientes primero.
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

// Devuelve el detalle completo de un pedido.
// El JOIN entre pedidos, pedido_producto y productos genera UNA FILA
// por cada producto del pedido. Si hay 3 productos, hay 3 filas con
// los datos del pedido repetidos y el producto distinto en cada una.
//
// CONSTRUCCIÓN DEL OBJETO:
//   rows[0] → datos del pedido (iguales en todas las filas)
//   rows.map() → extrae solo los datos del producto de cada fila
//   Resultado: un objeto con los datos del pedido + array de productos.
const getOrderById = async (id) => {
    const select = `
        SELECT p.id, p.total, p.estado, p.fecha_pedido, p.direccion_envio, p.metodo_pago,
               u.nombre AS cliente, u.mail, u.telefono,
               pp.cantidad, pp.precio_unidad,
               pr.id AS id_producto, pr.titulo, pr.imagen
        FROM pedidos p
        JOIN usuarios u          ON p.id_usuario = u.id
        JOIN pedido_producto pp   ON p.id = pp.id_pedido
        JOIN productos pr         ON pp.id_producto = pr.id
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

// Actualiza el estado de un pedido.
// El controlador ya validó que el estado sea uno de los cinco permitidos.
const updateOrderStatus = async (id, estado) => {
    const update = "UPDATE pedidos SET estado = ? WHERE id = ?"
    const [result] = await pool.query(update, [estado, id])
    if (result.affectedRows === 0) return false
    return result
}


// ── BLOQUE 5: DASHBOARD ──────────────────────────────────────

// Hace TRES queries y devuelve todo en un único objeto.
// El frontend lo recibe en una sola petición HTTP.
//
// selectStats usa CASE WHEN para contar condicionalmente:
//   SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END)
//   → equivale a COUNT(*) WHERE estado = 'entregado', pero en una sola pasada.
//
// LIMIT 10 en pedidos → solo los últimos 10 para el widget del dashboard.
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
            SUM(CASE WHEN estado = 'entregado'                        THEN 1 ELSE 0 END) AS entregados,
            SUM(CASE WHEN estado IN ('procesando', 'enviado')          THEN 1 ELSE 0 END) AS en_proceso,
            SUM(CASE WHEN estado = 'cancelado'                        THEN 1 ELSE 0 END) AS cancelados,
            SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END)                   AS ingresos_totales
        FROM pedidos
    `

    const [pedidos] = await pool.query(selectPedidos)
    const [pendientes] = await pool.query(selectPendientes)
    const [statsRows] = await pool.query(selectStats)

    return {
        pedidos,
        usuariosPendientes: pendientes,
        stats: statsRows[0]   // statsRows es un array de una fila → cogemos el objeto
    }
}


// ── BLOQUE 6: LISTAS PARA FORMULARIOS ───────────────────────

// Lista editoriales ordenadas alfabéticamente para los <select> de los formularios.
const getEditoriales = async () => {
    const select = "SELECT id, nombre FROM editoriales ORDER BY nombre"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}

// Lista categorías ordenadas alfabéticamente.
const getCategorias = async () => {
    const select = "SELECT id, nombre FROM categorias ORDER BY nombre"
    const [result] = await pool.query(select)
    if (result.length === 0) return false
    return result
}


// ── EXPORTACIÓN ──────────────────────────────────────────────
// Todas las funciones se exportan para que admin.controller.js las importe.
// Si una función no se exporta aquí, el controlador no puede llamarla
// aunque esté definida en este archivo.
module.exports = {
    // Usuarios
    validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById,
    getUsers, updateUser, deleteUser, checkUserActivePedidos,
    // Productos
    getProducts, getProductById, createProduct, updateProduct,
    checkProductInPedidos, deleteProduct, updateProductCategories,
    getEditorialIdByNombre, getCategoriaIdsByNombres,
    // Pedidos
    getOrders, getOrderById, updateOrderStatus,
    // Dashboard y listas
    getDashboard, getEditoriales, getCategorias
}