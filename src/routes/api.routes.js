const express = require('express');
const router = express.Router();

// Aquí iremos importando las rutas de cada módulo

router.use("/", require('./api_routes/usuarios.routes'));
router.use("/", require('./api_routes/admin.routes'));

module.exports = router;