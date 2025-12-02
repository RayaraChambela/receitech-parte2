// src/controllers/usuario.controller.js
const User = require('../models/User');

// ==========================
// ATUALIZAR PERFIL
// ==========================
exports.atualizarPerfil = async (req, res) => {
  try {
    const { id, name, email, senha } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (senha) {
      user.password = senha; // se tiver bcrypt, aplicar hash aqui
    }

    await user.save();

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res
      .status(500)
      .json({ error: 'Erro no servidor ao atualizar o perfil.' });
  }
};

// ==========================
// EXCLUIR CONTA
// ==========================
exports.excluirConta = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await user.destroy();

    return res.json({ success: true });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    return res
      .status(500)
      .json({ error: 'Erro no servidor ao excluir a conta.' });
  }
};

// ==========================
// LOGOUT
// ==========================
module.exports.logout = (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
};
