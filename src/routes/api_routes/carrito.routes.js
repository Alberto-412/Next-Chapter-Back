// TODAS LAS RUTAS DEL CARRITO , IMPORTANTE USARIO LOGIN (AUTH )
// IMPORTACIONES 

const express = require('express');
const router= express.Router();
const carritoControl = require('../../controllers/carrito.controller')
const auth = require('../../middleware/auth')

// GET /api/carrito → RUTA para el contenido del carrito
router.get('/', auth, carritoControl.getCarrito);

// POST /api/carrito → RUTA para añadir un producto
router.post('/', auth, carritoControl.addItem);

// PUT /api/carrito/:id_producto → cambiar la cantidad de un producto
router.put('/:id_producto', auth, carritoControl.updateCantidad);

// DELETE /api/carrito/:id_producto → quitar un producto concreto
router.delete('/:id_producto', auth, carritoControl.removeItem);

// DELETE /api/carrito → vaciar el carrito entero
router.delete('/', auth, carritoControl.vaciarCarrito);

module.exports = router;



