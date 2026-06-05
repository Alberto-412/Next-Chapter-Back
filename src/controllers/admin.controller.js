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
        const { productId } = req.params
        const result = await adminModel.getProductById(productId)
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

const createProduct = async (req, res) => {
    try {
        const { titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial } = req.body

        if (!titulo || !precio) {
            return res.status(400).json({ message: 'El título y el precio son obligatorios' })
        }

        const result = await adminModel.createProduct(titulo, descripcion, isbn, precio, stock ?? 0, pre_reserva ?? 0, imagen, fecha_publicacion, id_editorial)
        if (!result) return res.status(500).json({ message: 'Error al crear el producto' })

        return res.status(201).json({ msj: "Producto creado correctamente", id: result.insertId })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params
        const { titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial } = req.body

        if (!titulo || !precio) {
            return res.status(400).json({ message: 'El título y el precio son obligatorios' })
        }

        const result = await adminModel.updateProduct(productId, titulo, descripcion, isbn, precio, stock, pre_reserva, imagen, fecha_publicacion, id_editorial)
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })

        return res.status(200).json({ msj: "Producto actualizado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params

        const pedidos = await adminModel.checkProductInPedidos(productId)
        if (pedidos.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar un producto que tiene pedidos asociados' })
        }

        const result = await adminModel.deleteProduct(productId)
        if (!result) return res.status(404).json({ message: 'Producto no encontrado' })

        return res.status(200).json({ msj: "Producto eliminado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
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
        const { orderId } = req.params
        const result = await adminModel.getOrderById(orderId)
        if (!result) return res.status(404).json({ message: 'Pedido no encontrado' })
        return res.status(200).json(result)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { estado } = req.body

        const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' })
        }

        const result = await adminModel.updateOrderStatus(orderId, estado)
        if (!result) return res.status(404).json({ message: 'Pedido no encontrado' })
        return res.status(200).json({ msj: "Estado del pedido actualizado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
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
        const { nombre, mail, telefono, direccion, rol, activo } = req.body

        if (rol && rol !== 'admin' && rol !== 'cliente') {
            return res.status(400).json({ message: 'Rol no válido' })
        }

        const result = await adminModel.updateUser(userId, nombre, mail, telefono, direccion, rol, activo)
        if (!result) return res.status(404).json({ message: 'Usuario no encontrado' })
        return res.status(200).json({ msj: "Usuario actualizado correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params

        const pedidosActivos = await adminModel.checkUserActivePedidos(userId)
        if (pedidosActivos.length > 0) {
            return res.status(400).json({ message: 'No se puede dar de baja a un usuario con pedidos en curso' })
        }

        const result = await adminModel.deleteUser(userId)
        if (!result) return res.status(404).json({ message: 'Usuario no encontrado' })
        return res.status(200).json({ msj: "Usuario dado de baja correctamente" })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
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

module.exports = { validarUsuario, getUsuariosPendientes, updateRol, getUsuarioById, getProducts, getProductById, createProduct, updateProduct, deleteProduct, getOrders, getOrderById, updateOrderStatus, getUsers, updateUser, deleteUser, getDashboard }