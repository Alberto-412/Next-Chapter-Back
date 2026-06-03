const db = require('../config/conexion')


//CLIENTE 

// Pedidos de un usuario
const getPedidosByUsuario = async (id_usuario) => {
  const [rows] = await db.query(
    `SELECT id, total, estado, fecha_pedido, direccion_envio, metodo_pago
     FROM pedidos
     WHERE id_usuario = ?
     ORDER BY fecha_pedido DESC`,
    [id_usuario]
  );
  return rows;
};

// Cabecera de un pedido concreto(DATOS GENERALES DEL PEDIDO )
const getPedidoById = async (id_pedido) => {
    // QUERY DEVUELVE UN ARRAY DE COSAS, CON ROW DECIMOS QUE NOS DEVUELVA LAS FILAS, 
    // DESTRUCTURACIÓN: DEVOLVER  VALORES DE UN ARRAY POR POSICIÓN
    // ROWS ARRAY DE OBJETOS, UNA FILA POR CADA RESULTADO
  const [rows] = await db.query(
    `SELECT * FROM pedidos WHERE id = ?`,
    [id_pedido]
  );
  return rows[0];
};

// Obtener los productos de un pedido
// JOIN ME TRAE DATOS DE LAS DOS TABLAS A LA VEZ
const getProductosByPedido = async (id_pedido) => {
  const [rows] = await db.query(
    `SELECT pp.id_producto, pp.cantidad, pp.precio_unidad,
            p.titulo, p.imagen
     FROM pedido_producto pp
     JOIN productos p ON p.id = pp.id_producto 
     WHERE pp.id_pedido = ?`,
    [id_pedido]
  );
  return rows;
};

// Crear pedido desde el carrito (TRANSACCIÓN)
// GETCONNECTION NOS PERMITE QUE TODAS LAS OPERACIONES DE LA TRANSACCIÓN COJAN LA MISMA CONEXIÓN
const crearPedidoDesdeCarrito = async (id_usuario, direccion_envio, metodo_pago) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Buscar el carrito activo del usuario
    const [carritos] = await connection.query(
      `SELECT id FROM carrito WHERE id_usuario = ? AND estado = 'activo'`,
      [id_usuario]
    );
    if (carritos.length === 0) throw new Error('No tienes un carrito activo');
    const id_carrito = carritos[0].id;

    // 2. Obtener los productos del carrito con su precio y stock actuales
    const [items] = await connection.query(
      `SELECT cp.id_producto, cp.cantidad, p.precio, p.stock, p.titulo
       FROM carrito_producto cp
       JOIN productos p ON p.id = cp.id_producto
       WHERE cp.id_carrito = ?`,
      [id_carrito]
    );
    if (items.length === 0) throw new Error('El carrito está vacío');

    // 3. Calcular el total y comprobar que hay stock
    let total = 0;
    for (const item of items) {
      if (item.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${item.titulo}"`);
      }
      total += item.precio * item.cantidad;
    }

    // 4. Crear la cabecera del pedido
    const [resultPedido] = await connection.query(
      `INSERT INTO pedidos (id_usuario, total, direccion_envio, metodo_pago)
       VALUES (?, ?, ?, ?)`,
      [id_usuario, total, direccion_envio, metodo_pago]
    );
    const id_pedido = resultPedido.insertId;

    // 5. Copiar cada producto al pedido y restar stock
    for (const item of items) {
      await connection.query(
        `INSERT INTO pedido_producto (id_pedido, id_producto, cantidad, precio_unidad)
         VALUES (?, ?, ?, ?)`,
        [id_pedido, item.id_producto, item.cantidad, item.precio]
      );
      await connection.query(
        `UPDATE productos SET stock = stock - ? WHERE id = ?`,
        [item.cantidad, item.id_producto]
      );
    }

    // 6. Marcar el carrito como convertido
    await connection.query(
      `UPDATE carrito SET estado = 'convertido' WHERE id = ?`,
      [id_carrito]
    );

    await connection.commit();
    return id_pedido;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ---------- ADMIN ----------

// Listar todos los pedidos con datos del cliente
const getAllPedidos = async () => {
  const [rows] = await db.query(
    `SELECT p.id, p.total, p.estado, p.fecha_pedido,
            u.nombre, u.mail
     FROM pedidos p
     JOIN usuarios u ON u.id = p.id_usuario
     ORDER BY p.fecha_pedido DESC`
  );
  return rows;
};

// Cambiar el estado de un pedido
const cambiarEstado = async (id_pedido, estado) => {
  const [result] = await db.query(
    `UPDATE pedidos SET estado = ? WHERE id = ?`,
    [estado, id_pedido]
  );
  return result.affectedRows;
};

module.exports = {
  getPedidosByUsuario,
  getPedidoById,
  getProductosByPedido,
  crearPedidoDesdeCarrito,
  getAllPedidos,
  cambiarEstado,
};