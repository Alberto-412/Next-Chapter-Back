const router = require("express").Router()
const librosControl = require("../../controllers/libros.controller")
const isAdmin = require("../../middleware/isAdmin")
const { verifyToken } = require("../../utils/jwt")


// RUTAS PUBLICAS
// Listado
router.get("/libros", librosControl.getAll)

// Detalle id
router.get("/libros/:id", librosControl.getById)

// RUTAS PRIVADAS
// //Crear libro

//router.post("/libros", verifyToken, isAdmin, librosControl.createLibro)
// Temporal para probar
router.post("/libros", librosControl.createLibro)

module.exports = router
