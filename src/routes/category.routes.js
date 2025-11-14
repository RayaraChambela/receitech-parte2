const express = require('express');
const router = express.Router();
const { Category } = require('../db');

router.get('/', async (req, res) => {
  const categorias = await Category.findAll();
  res.render('categorias', { title: 'Categorias', categorias });
});

module.exports = router;
