const express = require('express')
const router = express.Router()
const admin = require('../../controllers/admin.controller')
const { checkToken } = require('../../middleware/auth')
const isAdmin = require('../../middleware/isAdmin')



// Rutas de admin
router.get("/admin/usuarios/pendientes", checkToken, isAdmin, admin.getUsuariosPendientes)
router.put("/admin/usuarios/:userId/validar", checkToken, isAdmin, admin.validarUsuario)
router.put("/admin/usuarios/:userId/rol", checkToken, isAdmin, admin.updateRol)
router.get("/admin/usuarios/:userId", checkToken, isAdmin, admin.getUsuarioById)

module.exports = router