// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const { Recipe } = require('../db');

router.get('/', async (req, res) => {
  try {
    const categoria    = req.query.categoria || null;
    const subcategoria = req.query.subcategoria || null;

    const where = {};

    // Se vier categoria (e não for vazia), filtra por ela
    if (categoria && categoria.toLowerCase() !== 'todas as receitas') {
      where.category = categoria;
    }

    // Se vier subcategoria, filtra também
    if (subcategoria) {
      where.subcategory = subcategoria;
    }

    const findOptions = {
      order: [['created_at', 'DESC']]
    };

    // Só adiciona where se tiver algum filtro
    if (Object.keys(where).length > 0) {
      findOptions.where = where;
    }

    const recipes = await Recipe.findAll(findOptions);

    // Título da página
    const tituloPagina = categoria
      ? (subcategoria ? `${categoria} › ${subcategoria}` : categoria)
      : 'Todas as receitas';

    return res.render('categorias', {
      title: tituloPagina,
      categoria: categoria || 'Todas as receitas',
      subcategoria,
      recipes
    });

  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
    return res.status(500).send('Erro ao carregar categorias.');
  }
});

module.exports = router;
