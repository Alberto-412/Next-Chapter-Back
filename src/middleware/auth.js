// ============================================================
// QUÉ HACE: Middleware que verifica el JWT en cada petición
//           a rutas protegidas. Se ejecuta ANTES del controlador.
//           Si el token es válido, añade el payload del usuario
//           a req.user para que el controlador lo pueda usar.
//
// FLUJO EN EXPRESS: req → auth → isAdmin → controlador → res
//           Si auth falla → res.401 y la cadena se corta.
//           Si auth pasa → next() y pasa al siguiente middleware.
// ============================================================

const { verifyToken } = require('../utils/jwt');

// Blacklist en memoria: Set de tokens que han hecho logout.
// LIMITACIÓN: se resetea al reiniciar el servidor.
// En producción, se usaría Redis u otra solución persistente.
const tokenBlacklist = new Set()

const auth = (req, res, next) => {
  try {
    // La cabecera llega como: "Authorization: Bearer eyJhbG..."
    // .split(' ')[1] → se queda solo con el token, sin el "Bearer ".
    // ?. → optional chaining: si authorization es undefined, no lanza error.
    const token = req.headers.authorization?.split(' ')[1];

    // Si no hay token → 401 Unauthorized (no autenticado).
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Si el token está en la blacklist (usuario hizo logout) → 401.
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token inválido, inicia sesión de nuevo' });
    }

    // verifyToken() lanza una excepción si el token está expirado o
    // la firma no coincide con JWT_SECRET. El catch lo convierte en 401.
    const decoded = verifyToken(token);

    // Añadimos el payload decodificado a req.user para que el siguiente
    // middleware (isAdmin) o el controlador pueda leer req.user.rol, req.user.id...
    req.user = decoded;

    // next() → pasa el control al siguiente middleware de la cadena (isAdmin o controlador).
    next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = auth