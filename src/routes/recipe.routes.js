const express = require('express');
const router = express.Router();
const { Recipe } = require('../db');

router.get('/', async (req, res) => {
  const receitas = await Recipe.findAll();
  res.render('index', { title: 'Receitas', receitas });
});

module.exports = router;
