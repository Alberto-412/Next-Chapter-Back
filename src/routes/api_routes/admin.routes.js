const express = require('express')
const router = express.Router()
const admin = require('../../controllers/admin.controller')
const auth = require('../../middleware/auth')
const isAdmin = require('../../middleware/isAdmin')



// Usuarios
router.get("/admin/usuarios/pendientes", auth, isAdmin, admin.getUsuariosPendientes) // Lista de usuarios pendientes de validar
router.put("/admin/usuarios/:userId/validar", auth, isAdmin, admin.validarUsuario) // Validar usuario
router.put("/admin/usuarios/:userId/rol", auth, isAdmin, admin.updateRol) // Dar rol Admin a un usuario

router.get("/admin/usuarios", auth, isAdmin, admin.getUsers) // Listar todos los usuarios
router.get("/admin/usuarios/:userId", auth, isAdmin, admin.getUsuarioById) // Obtener detalles de un usuario
router.put("/admin/usuarios/:userId", auth, isAdmin, admin.updateUser) // Editar usuario
router.delete("/admin/usuarios/:userId", auth, isAdmin, admin.deleteUser) // Eliminar usuario (marcar como inactivo)

// Dashboard
router.get("/admin/dashboard", auth, isAdmin, admin.getDashboard) // Obtener datos para el dashboard de administración

// Productos
router.get("/admin/products", auth, isAdmin, admin.getProducts) // Listar todos los productos
router.post("/admin/products", auth, isAdmin, admin.createProduct) // Crear un nuevo producto
router.get("/admin/products/:productId", auth, isAdmin, admin.getProductById) // Obtener detalles de un producto
router.put("/admin/products/:productId", auth, isAdmin, admin.updateProduct)   // Editar un producto
router.delete("/admin/products/:productId", auth, isAdmin, admin.deleteProduct) // Eliminar un producto (marcar como inactivo)

// Pedidos
router.get("/admin/orders", auth, isAdmin, admin.getOrders) // Listar todos los pedidos
router.get("/admin/orders/:orderId", auth, isAdmin, admin.getOrderById) // Obtener detalles de un pedido
router.put("/admin/orders/:orderId", auth, isAdmin, admin.updateOrderStatus) // Actualizar estado de un pedido


module.exports = router