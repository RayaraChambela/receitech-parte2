// src/routes/search.routes.js
const express = require('express');
const router = express.Router();
const { Recipe } = require('../db');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const termo = (req.query.termo || '').trim();

    let recipes = [];

    if (termo) {
      recipes = await Recipe.findAll({
        where: {
          title: {
            [Op.like]: `%${termo}%`   // busca no título (ajusta se quiser em description etc.)
          }
        },
        order: [['created_at', 'DESC']]
      });
    }

    return res.render('pesquisa', {
      title: termo ? `Resultados para "${termo}"` : 'Resultados da pesquisa',
      termo,
      recipes
    });
  } catch (err) {
    console.error('Erro na busca:', err);
    return res.status(500).send('Erro ao buscar receitas.');
  }
});

module.exports = router;
