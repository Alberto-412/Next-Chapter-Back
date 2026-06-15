// ============================================================
// QUÉ HACE: Segundo middleware de la cadena de rutas admin.
//           Se ejecuta DESPUÉS de auth (que ya verificó el token
//           y guardó el payload en req.user).
//           Comprueba que el rol sea 'admin'. Si no → 403.
//
// DIFERENCIA ENTRE 401 Y 403:
//   401 Unauthorized → no estás autenticado (sin token o token inválido).
//   403 Forbidden     → estás autenticado pero no tienes permiso.
// ============================================================

const isAdmin = (req, res, next) => {
  // req.user lo añadió el middleware auth justo antes.
  // Si llegamos aquí, el token es válido; solo falta comprobar el rol.
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado, se requiere rol admin' });
  }

  // El usuario es admin → next() pasa el control al controlador.
  next();
};

module.exports = isAdmin;