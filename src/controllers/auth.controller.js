// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password_hash,
      avatar_url: null,
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('Erro no register:', err);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

// GET /auth/me
exports.me = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    console.error('Erro no me:', err);
    return res.status(500).json({ error: 'Erro ao carregar usuário.' });
  }
};
