const adminModel = require('../models/admin.model');

// --- USUARIOS ---

const validarUsuario = async (req, res) => {
    try {
        const { userId } = req.params
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

const updateRol = async (req, res) => {
    try {
        const { userId } = req.params
        const { rol } = req.body
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

// --- PRODUCTOS ---

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

const createProduct = async (req, res) => {
    try {
        const { titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, editorial, categorias } = req.body

        if (!titulo || !precio) {
            return res.status(400).json({ message: 'El título y el precio son obligatorios' })
        }

        const result = await adminModel.createProduct(titulo, descripcion, isbn, precio, stock ?? 0, pre_reserva ?? 0, imagen, fecha_publicacion, editorial, categorias)
        if (!result) return res.status(500).json({ message: 'Error al crear el producto' })

        return res.status(201).json({ message: "Producto creado correctamente", id: result.insertId })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al crear el producto' })
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'ID de producto inválido' });
        }

        const { titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, editorial, categorias } = req.body

        if (!titulo || !precio) {
            return res.status(400).json({ message: 'El título y el precio son obligatorios' })
        }

        // Convertir fecha ISO a formato YYYY-MM-DD que MySQL entiende
        let fechaFormato = fecha_publicacion
        if (fecha_publicacion) {
            const fecha = new Date(fecha_publicacion)
            fechaFormato = fecha.toISOString().split('T')[0]
        }

        // Buscar el ID de la editorial por NOMBRE
        let idEditorial = null
        if (editorial && editorial.trim() !== '') {
            idEditorial = await adminModel.getEditorialIdByNombre(editorial)
        }

        const result = await adminModel.updateProduct(productId, titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fechaFormato, idEditorial)
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })

        // Buscar IDs de categorías por NOMBRES y actualizar
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

const getDashboard = async (req, res) => {
    try {
        const result = await adminModel.getDashboard()
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

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

module.exports = { validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById, getProducts, getProductById, createProduct, updateProduct, deleteProduct, getOrders, getOrderById, updateOrderStatus, getUsers, updateUser, deleteUser, getDashboard, getEditoriales, getCategorias }