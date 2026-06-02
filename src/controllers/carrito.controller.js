// FUNCIONES QUE NSO CONECTAN LAS PETICIONES QUE SE HACEN A TRAVÉS DE LAS RUTAS CON EL MODEL.

const carritoModel = require('../models/carrito.model')


// FUNCIÓN QUE OBTIENE CARRITO ACTIVO O CREA UNO SI NO EXISTE 
const obtenerOCrearCarrito = async (id_usuario) => {
  let carrito = await carritoModel.getCarritoActivo(id_usuario);
  if (!carrito) {
    const nuevoId = await carritoModel.crearCarrito(id_usuario);
    return nuevoId;
  }
  return carrito.id;
};

// GET /api/carrito → FUNCIÓN PARA VER QUE TIENE EL CARRITO.
const getCarrito = async (req, res) => {
  try {
    const id_carrito = await obtenerOCrearCarrito(req.user.id);
    const contenido = await carritoModel.getContenido(id_carrito);
    res.json(contenido);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// POST /api/carrito → FUNCIÓN PARA AÑADIR UN PRODUCTO
const addItem = async (req, res) => {
  try {
    const { id_producto, cantidad } = req.body;

    if (!id_producto || !cantidad || cantidad < 1) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const id_carrito = await obtenerOCrearCarrito(req.user.id);
    await carritoModel.addItem(id_carrito, id_producto, cantidad);
    res.status(201).json({ mensaje: 'Producto añadido al carrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir el producto' });
  }
};

// PUT /api/carrito/:id_producto → FUNCIÓN PARA CAMBIAR LA CANTIDAD 
const updateCantidad = async (req, res) => {
  try {
    const { id_producto } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }

    const id_carrito = await obtenerOCrearCarrito(req.user.id);
    await carritoModel.updateCantidad(id_carrito, id_producto, cantidad);
    res.json({ mensaje: 'Cantidad actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cantidad' });
  }
};

// DELETE /api/carrito/:id_producto → quitar un producto
const removeItem = async (req, res) => {
  try {
    const { id_producto } = req.params;
    const id_carrito = await obtenerOCrearCarrito(req.user.id);
    await carritoModel.removeItem(id_carrito, id_producto);
    res.json({ mensaje: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// DELETE /api/carrito → vaciar el carrito
const vaciarCarrito = async (req, res) => {
  try {
    const id_carrito = await obtenerOCrearCarrito(req.user.id);
    await carritoModel.vaciarCarrito(id_carrito);
    res.json({ mensaje: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

module.exports = {obtenerOCrearCarrito,getCarrito,addItem,updateCantidad,removeItem,vaciarCarrito};