const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado, se requiere rol admin' });
  }
  next();
};

module.exports = isAdmin;