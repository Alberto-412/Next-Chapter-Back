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
// Temporal para probar sin verifyToken ni IsAdmin
router.post("/libros", librosControl.createLibro)

// Ruta para editar un libro por su id
// Temporal para probar sin verifyToken ni IsAdmin
router.put("/libros/:id", librosControl.updateById)

// Ruta para borrar un libro por su id
// Temporal para probar sin verifyToken ni IsAdmin
router.delete("/libros/:id", librosControl.deleteById)

module.exports = router
