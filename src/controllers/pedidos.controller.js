// IMPORTAMOS ARCHIVO MODEL
const pedidosModel = require('../models/pedidos.model')


// GET /api/orders → listar mis pedidos
const getMisPedidos = async (req, res) => {
  try {
    const pedidos = await pedidosModel.getPedidosByUsuario(req.user.id);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

// GET /api/orders/:id → detalle de un pedido (cabecera + productos)
const getPedidoDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await pedidosModel.getPedidoById(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // PERMITE QUE OTRO USUARIO NO VEA UN PEDIDO QUE NO ES SUYO. ADEMÁS INDICA QUE TODOS LOS PEDIDOS SOLO LOS PUEDEN VER LO ADMIN 
    if (pedido.id_usuario !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este pedido' });
    }

    const productos = await pedidosModel.getProductosByPedido(id);
    res.json({ ...pedido, productos });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

// POST /api/orders → crear pedido desde el carrito
const crearPedido = async (req, res) => {
  try {
    const { direccion_envio, metodo_pago } = req.body;

    if (!direccion_envio || !metodo_pago) {
      return res.status(400).json({ error: 'Faltan datos del pedido' });
    }

    const id_pedido = await pedidosModel.crearPedidoDesdeCarrito(
      req.user.id, direccion_envio, metodo_pago
    );
    res.status(201).json({ mensaje: 'Pedido creado correctamente', id_pedido });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST /api/checkout/payment → procesar el pago (simulado)
const procesarPago = async (req, res) => {
  try {
    const { id_pedido } = req.body;
    // En un proyecto real aquí iría la pasarela de pago (Stripe, etc).
    // Como es académico, simulamos un pago correcto.
    res.json({ mensaje: 'Pago procesado correctamente', id_pedido, estado: 'pagado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
};

// GET /api/admin/orders → listar todos los pedidos (admin)
//const getTodosPedidos = async (req, res) => {
 // try {
   // const pedidos = await pedidosModel.getAllPedidos();
   // res.json(pedidos);
  //} catch (error) {
   // res.status(500).json({ error: 'Error al obtener los pedidos' });
 // }
//};

// PUT /api/admin/orders/:id → cambiar el estado de un pedido (admin)
//const cambiarEstado = async (req, res) => {
  //try {
    //const { id } = req.params;
    //const { estado } = req.body;

    //const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    //if (!estadosValidos.includes(estado)) {
      //return res.status(400).json({ error: 'Estado no válido' });
   // }

    //const filas = await pedidosModel.cambiarEstado(id, estado);
    //if (filas === 0) {
     // return res.status(404).json({ error: 'Pedido no encontrado' });
    //}
    //res.json({ mensaje: 'Estado actualizado', estado });
 // } catch (error) {
   // res.status(500).json({ error: 'Error al actualizar el estado' });
 // }
//};

module.exports = {
  getMisPedidos,
  getPedidoDetalle,
  crearPedido,
  procesarPago,
};