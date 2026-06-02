const express = require('express');
const router = express.Router();

// Aquí iremos importando las rutas de cada módulo

// IMPORTACIÓN CARRITO ROUTES 
const carritoRoutes = require('./api_routes/carrito.routes')
router.use('/carrito', carritoRoutes)


module.exports = router;