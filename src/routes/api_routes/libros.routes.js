const router = require("express").Router()
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const librosControl = require("../../controllers/libros.controller")


// RUTAS PUBLICAS
// Listado
router.get("/libros", librosControl.getAll)


// Mostrar los autores de un libro
router.get("/libros/:id/autores", librosControl.getAutoresByLibro);

// Detalle id
router.get("/libros/:id", librosControl.getById)





// RUTAS PRIVADAS

//Crear libro
//router.post("/libros", !!!!!auth!!!!!, isAdmin, librosControl.createLibro)
router.post("/libros", auth, isAdmin, librosControl.createLibro)

// Ruta para editar un libro por su id
router.put("/libros/:id", auth, isAdmin, librosControl.updateById)

// Ruta para borrar un libro por su id
router.delete("/libros/:id", auth, isAdmin, librosControl.deleteById)


// Añadir autores a un libro
router.post("/libros/:id/autores", auth, isAdmin, librosControl.addAutorToLibro);


// Quitar autores de un libro
router.delete("/libros/:id/autores/:autorId", auth, isAdmin, librosControl.removeAutorFromLibro);

module.exports = router
