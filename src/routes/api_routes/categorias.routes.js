const router = require("express").Router();


const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const categoriasControl = require("../../controllers/categorias.controller");

// Rutas pública 
// 
//para buscar categorías
router.get("/categorias", categoriasControl.getAllCategorias);

// Mostrar una categoría por su id
router.get("/categorias/:id", categoriasControl.getById);

//Rutas privadas
// Mientras tanto no usaremos el verify token ni el IsAdmin para poder probar
// crear una categoría
router.post("/categorias", auth, isAdmin, categoriasControl.createCategoria);

// Editar una categoría por su id
router.put("/categorias/:id", auth, isAdmin, categoriasControl.updateById);

// Borrar una categoría por su id
router.delete("/categorias/:id", auth, isAdmin, categoriasControl.deleteById);

module.exports = router;