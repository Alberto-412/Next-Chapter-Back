const router = require("express").Router();
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const editorialesControl = require("../../controllers/editorial.controller");

//Rutas publicas
// Mostrar todas las editoriales
router.get("/editorial", editorialesControl.getAllEditoriales);
// Mostrar una editorial por id
router.get("/editorial/:id", editorialesControl.getById);

//Rutas privadas
// Crear editorial
router.post("/editorial", auth, isAdmin, editorialesControl.createEditorial);
// Editar editoriales
router.put("/editorial/:id", auth, isAdmin, editorialesControl.updateById);

// Borrar editoriales
router.delete("/editorial/:id", auth, isAdmin, editorialesControl.deleteById);


module.exports = router;