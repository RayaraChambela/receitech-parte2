// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const { Recipe } = require('../db');

router.get('/', async (req, res) => {
  try {
    const categoria = req.query.categoria || null;
    const subcategoria = req.query.subcategoria || null;

    if (!categoria) {
      return res.status(400).send("Categoria não informada.");
    }

    // Se tiver subcategoria → filtra pelas duas
    const where = {
      category: categoria
    };

    if (subcategoria) {
      where.subcategory = subcategoria;
    }

    const recipes = await Recipe.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return res.render('categorias', {
      title: categoria,
      categoria,
      subcategoria, // ← AGORA EXISTE
      recipes
    });

  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
    return res.status(500).send("Erro ao carregar categorias.");
  }
});

module.exports = router;
