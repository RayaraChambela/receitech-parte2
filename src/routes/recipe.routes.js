// src/routes/recipe.routes.js
const express = require('express');
const router = express.Router();

const recipeController = require('../controllers/recipe.controller');
const uploadRecipe = require('../config/multerReceitas');

// DEBUG PROVISÓRIO
router.get('/debug', (req, res) => {
  console.log('🔥 Rota /receitas/debug acessada');
  res.send('Rota de receitas OK');
});

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

// receitas de um usuário (JSON)
router.get('/usuario/:userId', recipeController.listByUser);

// formulário de edição
router.get('/:id/editar', recipeController.editForm);

// atualizar receita (1 imagem opcional, campo "image")
router.put(
  '/:id',
  uploadRecipe.single('image'),
  recipeController.update
);

// excluir receita
router.delete('/:id', recipeController.delete);

// detalhe da receita
router.get('/:id', recipeController.show);

// comentários
router.post('/:id/comentarios', recipeController.addComment);
router.put('/:id/comentarios/:commentId', recipeController.updateComment);
router.delete('/:id/comentarios/:commentId', recipeController.deleteComment);

module.exports = router;
