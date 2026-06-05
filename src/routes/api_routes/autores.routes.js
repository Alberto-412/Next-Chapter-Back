const router = require("express").Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const autoresControl = require("../../controllers/autores.controller");


// Ruta para mostrar todos los autores
router.get("/autores", autoresControl.getAllAutores);

// Mostrar un autor por su id
router.get("/autores/:id", autoresControl.getById);

//RUTAS PRIVADAS
// Crear autor
router.post("/autores", auth, isAdmin, autoresControl.createAutor);

// Editar autor
router.put("/autores/:id", auth, isAdmin, autoresControl.updateById);

// Borrar autores
router.delete("/autores/:id", auth, isAdmin, autoresControl.deleteById);

module.exports = router;