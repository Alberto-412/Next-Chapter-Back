const pool = require("../config/conexion");

/**
 * Buscar reseñas de un libro.
 *
 * Recibe el id del producto/libro y devuelve
 * todas las reseñas asociadas a ese libro.
 */
const selectResenasByLibro = async (idProducto) => {
    const sql = `
    SELECT
      r.id,
      r.calificacion,
      r.comentario,
      r.fecha,
      r.id_usuario,
      r.id_producto,
      u.nombre AS usuario_nombre,
      u.mail AS usuario_mail
    FROM resenas r
    LEFT JOIN usuarios u
      ON r.id_usuario = u.id
    WHERE r.id_producto = ?
    ORDER BY r.fecha DESC
  `;

    const [result] = await pool.query(sql, [idProducto]);

    return result;
};

module.exports = {
    selectResenasByLibro,
};