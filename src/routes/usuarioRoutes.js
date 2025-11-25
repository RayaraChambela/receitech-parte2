// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');
const upload = require('../config/multer');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { Recipe } = require('../db'); // já importa aqui

// ==========================
// FUNÇÃO AUXILIAR: apagar arquivo antigo, se existir
// ==========================
function deleteAvatarFile(avatarUrl) {
  if (!avatarUrl) return;

  // avatarUrl vem como "/uploads/avatars/arquivo.webp"
  const relativePath = avatarUrl.startsWith('/')
    ? avatarUrl.slice(1)
    : avatarUrl;

  const fullPath = path.join(__dirname, '..', '..', 'public', relativePath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Erro ao apagar arquivo de avatar:', err);
    }
  });
}

// ==========================
// EXCLUIR CONTA
// ==========================
router.delete('/excluir', usuarioController.excluirConta);

// ==========================
// SALVAR / ATUALIZAR AVATAR (POST /usuario/avatar)
// ==========================
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail não enviado.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // apaga avatar antigo, se houver
    if (user.avatar_url) {
      deleteAvatarFile(user.avatar_url);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar_url = avatarUrl;
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
    console.error('Erro ao atualizar avatar:', err);
    return res.status(500).json({ error: 'Erro ao atualizar avatar.' });
  }
});

// ==========================
// REMOVER AVATAR (DELETE /usuario/avatar)
// ==========================
router.delete('/avatar', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail não enviado.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // apaga o arquivo físico, se houver
    if (user.avatar_url) {
      deleteAvatarFile(user.avatar_url);
    }

    user.avatar_url = null;
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
    console.error('Erro ao remover avatar:', err);
    return res.status(500).json({ error: 'Erro ao remover avatar.' });
  }
});

// ==========================
// PERFIL PÚBLICO DO USUÁRIO (GET /usuario/:id)
// ==========================
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const publicUser = await User.findByPk(userId);
    if (!publicUser) {
      return res.status(404).send('Usuário não encontrado.');
    }

    const recipes = await Recipe.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    return res.render('perfil-publico', {
      title: publicUser.name,
      publicUser,   // 🔹 nome bate com o que o EJS espera
      recipes,
    });
  } catch (err) {
    console.error('Erro ao carregar perfil público:', err);
    return res.status(500).send('Erro ao carregar perfil público.');
  }
});

module.exports = router;
