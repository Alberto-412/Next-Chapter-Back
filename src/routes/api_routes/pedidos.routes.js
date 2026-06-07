const express = require('express');
const router = express.Router();
const pedidosControl = require('../../controllers/pedidos.controller');
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');

// router.MÉTODO('RUTA', MIDDLEWARE, FUNCIÓN_CONTROLLER)

//CLIENTE
router.get('/orders', auth, pedidosControl.getMisPedidos);
router.get('/orders/:id', auth, pedidosControl.getPedidoDetalle);
router.post('/orders', auth, pedidosControl.crearPedido);

//CHECKOUT
router.post('/checkout/payment', auth, pedidosControl.procesarPago);

//ADMIN
// router.get('/admin/orders', [auth, isAdmin], pedidosControl.getTodosPedidos);
// router.get('/admin/orders/:id', [auth, isAdmin], pedidosControl.getPedidoDetalle);
// router.put('/admin/orders/:id', [auth, isAdmin], pedidosControl.cambiarEstado);

module.exports = router;