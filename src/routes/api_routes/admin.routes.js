const express = require('express')
const router = express.Router()
const admin = require('../../controllers/admin.controller')
const auth = require('../../middleware/auth')
const isAdmin = require('../../middleware/isAdmin')



// Rutas de admin
router.get("/admin/usuarios/pendientes", auth, isAdmin, admin.getUsuariosPendientes)
router.put("/admin/usuarios/:userId/validar", auth, isAdmin, admin.validarUsuario)
router.put("/admin/usuarios/:userId/rol", auth, isAdmin, admin.updateRol)
router.get("/admin/usuarios/:userId", auth, isAdmin, admin.getUsuarioById)

module.exports = router