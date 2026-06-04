const { verifyToken } = require('../utils/jwt');

const tokenBlacklist = new Set()

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token inválido, inicia sesión de nuevo' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = auth