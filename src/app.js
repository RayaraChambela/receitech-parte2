// src/app.js
const path = require('path');
const express = require('express');

const { Recipe, Category } = require('./db');

const recipeRoutes = require('./routes/recipe.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('src/routes/usuarioRoutes');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Home
app.get('/', async (req, res) => {
  try {
    const receitas = await Recipe.findAll({ order: [['created_at', 'DESC']] });
    const categorias = await Category.findAll({ order: [['name', 'ASC']] });

    res.render('index', {
      title: 'Receita Tech',
      receitas,
      categorias,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar a página inicial.');
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Cadastro
app.get('/register', (req, res) => {
  res.render('register', { title: 'Cadastro de Usuário' });
});

// Perfil
app.get('/perfil', (req, res) => {
  res.render('perfil', { title: 'Meu Perfil' });
});


// Rotas de API
app.use('/auth', authRoutes);
app.use('/receitas', recipeRoutes);
app.use('/categorias', categoryRoutes);
app.use('/usuario', usuarioRoutes);

// 404 simples (pra não quebrar tentando renderizar view 404 inexistente)
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

module.exports = app;
