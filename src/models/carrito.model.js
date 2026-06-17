// PARTE RELACIONADA CON BASE DE DATOS. FUNCIONES ASÍNCRONAS.

const db = require('../config/conexion')

//FUNCIÓN PARA BUSCAR EL CARRITO ACTIVO DE UN USUARIO.

const getCarritoActivo = async (id_usuario) => {
    const[rows] = await db.query(
        `SELECT id FROM carrito WHERE id_usuario = ? AND estado = 'activo'`,
        [id_usuario]
    );
    return rows[0]; //esto nos devolverá el carrito o undefined si no tiene 
}

//FUNCIÓN PARA CREAR UN CARRITO NUEVO PARA UN USUARIO.
const crearCarrito = async (id_usuario) => {
  const [result] = await db.query(
    `INSERT INTO carrito (id_usuario, estado) VALUES (?, 'activo')`,
    [id_usuario]
  );
  return result.insertId; // devuelve el id del carrito recién creado
};

// FUNCIÓN PARA INDICAR EL CONTENIDO DLE CARRITO

const getContenido = async (id_carrito) => {
  const [rows] = await db.query(
    `SELECT cp.id_producto, cp.cantidad,
            p.titulo, p.precio, p.imagen, p.stock
     FROM carrito_producto cp
     JOIN productos p ON p.id = cp.id_producto
     WHERE cp.id_carrito = ?`,
    [id_carrito]
  );
  return rows;
};

// FUNCIÓN QUE NOS AÑADE UN PRODUCTO AL CARRITO ( SI  HAY YA UN LIBRO , SUMA LA CANTIDAD)
// LO QUE HABÍA Y LO NUEVO 

const addItem = async (id_carrito, id_producto, cantidad) => {
  await db.query(
    `INSERT INTO carrito_producto (id_carrito, id_producto, cantidad)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE cantidad = cantidad + ?`,
    [id_carrito, id_producto, cantidad, cantidad]
  );
};

// FUNCIÓN QUE PERMITE MODIFICAR CANTIDADES EXACTAS, SIN NECESIDAR DE TICAR UNA A UNA.
// REEMPLAZA , EL NÚMERO FINAL EXACTO 
const updateCantidad = async (id_carrito, id_producto, cantidad) => {
  await db.query(
    `UPDATE carrito_producto SET cantidad = ?
     WHERE id_carrito = ? AND id_producto = ?`,
    [cantidad, id_carrito, id_producto]
  );
};


// FUNCIÓN PARA QUITAR UN PRODCUTO DEL CARRITO

const removeItem = async (id_carrito, id_producto) => {
  await db.query(
    `DELETE FROM carrito_producto
     WHERE id_carrito = ? AND id_producto = ?`,
    [id_carrito, id_producto]
  );
};

// FUNCIÓN PARA VACIAR EL CARRITO 
const vaciarCarrito = async (id_carrito) => {
  await db.query(
    `DELETE FROM carrito_producto WHERE id_carrito = ?`,
    [id_carrito]
  );
};

module.exports = {getCarritoActivo,crearCarrito,getContenido,addItem,removeItem,vaciarCarrito, updateCantidad}