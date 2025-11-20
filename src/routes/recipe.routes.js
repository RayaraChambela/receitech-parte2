// src/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipe.controller');
const uploadRecipe = require('../config/multerReceitas');

// tela de nova receita
router.get('/nova', (req, res) => {
  res.render('nova-receita', { title: 'Criar nova receita' });
});

// cria receita (1 imagem, campo "image")
router.post(
  '/',
  uploadRecipe.single('image'),
  recipeController.create
);

// *** NOVA ROTA: receitas de um usuário (JSON) ***
// IMPORTANTE: vem ANTES de router.get('/:id')
router.get('/usuario/:userId', recipeController.listByUser);

// detalhe da receita
router.get('/:id', recipeController.show);

module.exports = router;
