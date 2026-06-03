const express = require('express');
const router = express.Router();

// Aquí iremos importando las rutas de cada módulo, y montándolas desde la raíz.

// IMPORTACIÓN CARRITO ROUTES 
const carritoRoutes = require('./api_routes/carrito.routes')
router.use('/cart', carritoRoutes)

// IMPORTAMOS PEDIDOS ROUTES 
const pedidosRoutes = require('./api_routes/pedidos.routes')
router.use('/', pedidosRoutes);

module.exports = router;