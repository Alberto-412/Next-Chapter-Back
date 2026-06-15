// ============================================================
// QUÉ HACE: Router raíz del backend. Importa todos los routers
//           de módulo y los monta bajo la ruta /api (definida
//           en server.js con app.use('/api', apiRoutes)).
//           Es el "índice" de todas las rutas de la aplicación.
// ============================================================

const router = require("express").Router()

// Aquí iremos importando las rutas de cada módulo, y montándolas desde la raíz.
// IMPORTAMOS PEDIDOS ROUTES 
const pedidosRoutes = require('./api_routes/pedidos.routes')
// IMPORTACIÓN CARRITO ROUTES 
const carritoRoutes = require('./api_routes/carrito.routes')

router.use('/cart', carritoRoutes)
router.use('/', pedidosRoutes);

router.use("/", require("./api_routes/libros.routes"))
router.use("/", require("./api_routes/categorias.routes"))
router.use("/", require("./api_routes/autores.routes"))
router.use("/", require("./api_routes/editorial.routes"))

router.use("/", require('./api_routes/usuarios.routes'));
router.use("/", require('./api_routes/admin.routes'));

router.use("/", require("./api_routes/resenas.routes"));

router.use("/", require("./api_routes/newsletter.routes"));

router.use('/', require('./api_routes/contacto.routes'));

module.exports = router;
