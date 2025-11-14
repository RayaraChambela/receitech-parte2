// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.userEmail = payload.email;
    return next();
  } catch (err) {
    console.error('Erro no token:', err.message);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
