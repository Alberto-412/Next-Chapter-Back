// ============================================================
// QUÉ HACE: Intermediario entre las rutas y el modelo.
//           Recibe req (petición) y res (respuesta), valida los
//           datos de entrada, llama al modelo y devuelve el
//           código HTTP y el JSON adecuados.
//
// PATRÓN COMÚN DE CADA FUNCIÓN:
//   1. Leer parámetros (req.params) o datos del body (req.body).
//   2. Validar (parseInt para IDs, comprobaciones de campos obligatorios...).
//   3. Llamar al modelo con await.
//   4. Si el modelo devuelve false → 404. Si lanza error → 500.
//   5. Si todo va bien → 200/201 con el mensaje o los datos.
// ============================================================

const adminModel = require('../models/admin.model');


// ── BLOQUE 1: USUARIOS ───────────────────────────────────────

// Aprueba la cuenta de un usuario (pone validado = 1).
// El frontend lo llama desde el dashboard y desde la página de usuarios.
const validarUsuario = async (req, res) => {
    try {
        const { userId } = req.params      // viene de la URL: /admin/usuarios/:userId
        const result = await adminModel.validarUsuario(userId)
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        return res.status(200).json({ msj: "Usuario validado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

// Lista los usuarios con validado = 0.
// Si no hay ninguno, el modelo devuelve false → 404.
const getUsuariosPendientes = async (req, res) => {
    try {
        const result = await adminModel.getUsuariosPendientes()
        if (!result) {
            return res.status(404).json({ message: 'No hay usuarios pendientes de validación' })
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

// Cambia el rol de un usuario.
// VALIDACIÓN: solo se permiten los roles 'admin' y 'cliente'.
// Cualquier otro valor devuelve 400 antes de llamar al modelo.
const updateRol = async (req, res) => {
    try {
        const { userId } = req.params
        const { rol } = req.body          // viene del body: { rol: "admin" }
        if (rol !== 'admin' && rol !== 'cliente') {
            return res.status(400).json({ message: 'Rol no válido' })
        }
        const result = await adminModel.updateRol(userId, rol)
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        return res.status(200).json({ msj: "Rol actualizado correctamente" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

// Devuelve los datos completos de un usuario por ID.
// El modelo excluye la contraseña de la SELECT.
const getUsuarioById = async (req, res) => {
    try {
        const { userId } = req.params
        const result = await adminModel.getUsuarioById(userId)
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }
        return res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}

// Lista todos los usuarios del sistema.
const getUsers = async (req, res) => {
    try {
        const result = await adminModel.getUsers()
        if (!result) return res.status(404).json({ message: 'No hay usuarios' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

// Actualiza los datos editables de un usuario.
// VALIDACIÓN:
//   · parseInt(userId) → forzamos número para evitar SQL injection por tipo.
//   · rol solo puede ser 'admin' o 'cliente' (si se envía).
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params
        const id = parseInt(userId, 10)
        const { nombre, mail, telefono, direccion, rol, activo } = req.body

        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de usuario inválido' })
        }
        if (rol && rol !== 'admin' && rol !== 'cliente') {
            return res.status(400).json({ message: 'Rol no válido' })
        }

        const result = await adminModel.updateUser(id, nombre, mail, telefono, direccion, rol, activo)
        if (!result) return res.status(404).json({ message: 'Usuario no encontrado' })
        return res.status(200).json({ message: "Usuario actualizado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al actualizar el usuario' })
    }
}

// Baja lógica de usuario.
// GUARDAS PREVIAS:
//   1. Valida que el ID sea un número (parseInt + isNaN).
//   2. Comprueba si tiene pedidos activos (estado pendiente/procesando/enviado).
//      Si los tiene → 400. El frontend muestra el mensaje del backend.
// El modelo pone activo = 0, no hace DELETE.
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params
        const id = parseInt(userId, 10)

        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de usuario inválido' })
        }

        const pedidosActivos = await adminModel.checkUserActivePedidos(id)
        if (pedidosActivos && pedidosActivos.length > 0) {
            return res.status(400).json({ message: 'No se puede dar de baja a un usuario con pedidos en curso' })
        }

        const result = await adminModel.deleteUser(id)
        if (!result) return res.status(404).json({ message: 'Usuario no encontrado' })
        return res.status(200).json({ message: "Usuario dado de baja correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al dar de baja al usuario' })
    }
}


// ── BLOQUE 2: DASHBOARD ──────────────────────────────────────

// El modelo hace tres queries en paralelo y las devuelve en un único objeto.
// No hay validación de entrada porque no recibe parámetros.
const getDashboard = async (req, res) => {
    try {
        const result = await adminModel.getDashboard()
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}


// ── BLOQUE 3: PRODUCTOS ──────────────────────────────────────

// Lista todos los productos con nombres de editorial, autores y categorías.
const getProducts = async (req, res) => {
    try {
        const result = await adminModel.getProducts()
        if (!result) return res.status(404).json({ message: 'No hay productos' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

// Devuelve un producto por ID. parseInt evita que un string llegue al modelo.
const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }
        const result = await adminModel.getProductById(productId)
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al obtener el producto' })
    }
}

// Crea un producto nuevo.
// VALIDACIÓN: titulo y precio son obligatorios.
// ?? 0 → operador nullish coalescing: si stock o pre_reserva son null/undefined, usa 0.
// 201 Created → código correcto para creación (no 200).
const createProduct = async (req, res) => {
    try {
        const { titulo, descripcion, isbn, precio, stock, pre_reserva,
            imagen, fecha_publicacion, editorial, categorias } = req.body

        if (!titulo || !precio) {
            return res.status(400).json({ message: 'El título y el precio son obligatorios' })
        }

        const result = await adminModel.createProduct(
            titulo, descripcion, isbn, precio,
            stock ?? 0, pre_reserva ?? 0,
            imagen, fecha_publicacion, editorial, categorias
        )
        if (!result) return res.status(500).json({ message: 'Error al crear el producto' })

        // result.insertId → ID del registro recién creado en MySQL
        return res.status(201).json({ message: "Producto creado correctamente", id: result.insertId })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al crear el producto' })
    }
}

// Actualiza un producto.
// PROCESO EN TRES PASOS:
//   1. Convierte la fecha ISO ("2020-01-15T00:00:00.000Z") a "YYYY-MM-DD"
//      porque MySQL no acepta el formato ISO completo en columnas DATE.
//   2. Resuelve el NOMBRE de la editorial a su ID en la base de datos.
//      El frontend trabaja con nombres; la tabla productos guarda IDs.
//   3. Resuelve los NOMBRES de categorías a sus IDs y actualiza
//      la tabla intermedia producto_categoria (borra las antiguas e inserta las nuevas).
const updateProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }

        const { titulo, descripcion, isbn, precio, stock, pre_reserva,
            imagen, fecha_publicacion, editorial, categorias } = req.body

        if (!titulo || !precio) {
            return res.status(400).json({ message: 'El título y el precio son obligatorios' })
        }

        // PASO 1: Conversión de fecha
        let fechaFormato = fecha_publicacion
        if (fecha_publicacion) {
            const fecha = new Date(fecha_publicacion)
            fechaFormato = fecha.toISOString().split('T')[0]   // "2020-01-15"
        }

        // PASO 2: Nombre de editorial → ID
        let idEditorial = null
        if (editorial && editorial.trim() !== '') {
            idEditorial = await adminModel.getEditorialIdByNombre(editorial)
        }

        const result = await adminModel.updateProduct(
            productId, titulo, descripcion, isbn, precio, stock,
            pre_reserva, imagen, fechaFormato, idEditorial
        )
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })

        // PASO 3: Nombres de categorías → IDs → actualizar tabla intermedia
        if (categorias && categorias.trim() !== '') {
            const categoriasArray = categorias.split(',').map(c => c.trim()).filter(c => c !== '')
            if (categoriasArray.length > 0) {
                const categoriasIds = await adminModel.getCategoriaIdsByNombres(categoriasArray)
                if (categoriasIds.length > 0) {
                    await adminModel.updateProductCategories(productId, categoriasIds)
                }
            }
        }

        return res.status(200).json({ message: "Producto actualizado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al actualizar el producto' })
    }
}

// Elimina un producto.
// GUARDA PREVIA: comprueba si el producto aparece en pedido_producto.
// Si tiene pedidos asociados → 400 (no se puede borrar porque rompería el historial).
const deleteProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }

        const pedidos = await adminModel.checkProductInPedidos(productId)
        if (pedidos.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar un producto que tiene pedidos asociados' })
        }

        const result = await adminModel.deleteProduct(productId)
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })
        return res.status(200).json({ message: "Producto eliminado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al eliminar el producto' })
    }
}


// ── BLOQUE 4: PEDIDOS ────────────────────────────────────────

// Lista todos los pedidos con nombre y email del cliente.
const getOrders = async (req, res) => {
    try {
        const result = await adminModel.getOrders()
        if (!result) return res.status(404).json({ message: 'No hay pedidos' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

// Devuelve el detalle completo de un pedido (productos, cliente, totales).
// El modelo devuelve un objeto ya construido con array de productos.
const getOrderById = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'ID de pedido inválido' });
        }
        const result = await adminModel.getOrderById(orderId)
        if (!result) return res.status(404).json({ message: 'Pedido no encontrado' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al obtener el pedido' })
    }
}

// Actualiza el estado de un pedido.
// VALIDACIÓN: lista blanca de estados. Si llega uno desconocido → 400.
// Esto evita que un string arbitrario llegue al UPDATE de MySQL.
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId, 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'ID de pedido inválido' });
        }

        const { estado } = req.body
        const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' })
        }

        const result = await adminModel.updateOrderStatus(orderId, estado)
        if (!result) return res.status(404).json({ message: 'Pedido no encontrado' })
        return res.status(200).json({ message: "Estado del pedido actualizado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al actualizar el pedido' })
    }
}


// ── BLOQUE 5: LISTAS PARA FORMULARIOS ───────────────────────
// Estas funciones no tienen equivalente en el frontend todavía
// (el frontend extrae editoriales y categorías de los propios productos).

const getEditoriales = async (req, res) => {
    try {
        const result = await adminModel.getEditoriales()
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al obtener editoriales' })
    }
}

const getCategorias = async (req, res) => {
    try {
        const result = await adminModel.getCategorias()
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al obtener categorías' })
    }
}


// ── EXPORTACIÓN ──────────────────────────────────────────────
// Se exportan todas las funciones para que admin.routes.js las use.
module.exports = {
    validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById,
    getProducts, getProductById, createProduct, updateProduct, deleteProduct,
    getOrders, getOrderById, updateOrderStatus,
    getUsers, updateUser, deleteUser,
    getDashboard, getEditoriales, getCategorias
}