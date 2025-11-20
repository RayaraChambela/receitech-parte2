// src/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');
const upload = require('../config/multer');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// ==========================
// EXCLUIR CONTA
// ==========================
router.delete('/excluir', usuarioController.excluirConta);

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
        avatar_url: user.avatar_url
      }
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
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Erro ao remover avatar:', err);
    return res.status(500).json({ error: 'Erro ao remover avatar.' });
  }
});

module.exports = router;
