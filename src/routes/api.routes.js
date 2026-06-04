const router = require("express").Router()

router.use("/", require("./api_routes/libros.routes"))
router.use("/", require("./api_routes/categorias.routes"))

router.use("/", require('./api_routes/usuarios.routes'));
router.use("/", require('./api_routes/admin.routes'));

module.exports = router;
