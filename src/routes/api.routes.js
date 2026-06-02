const router = require("express").Router()

router.use("/", require("./api_routes/libros.routes"))

module.exports = router