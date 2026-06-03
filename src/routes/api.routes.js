const router = require("express").Router()

router.use("/", require("./api_routes/libros.routes"))
router.use("/", require("./api_routes/categorias.routes"))

module.exports = router