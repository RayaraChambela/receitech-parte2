// src/app.js
const path = require('path');
const express = require('express');

const { Recipe, Category } = require('./db');

// Rotas
const recipeRoutes = require('./routes/recipe.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// =========================
// VIEW ENGINE (EJS)
// =========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =========================
// MIDDLEWARES GLOBAIS
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// ARQUIVOS ESTÁTICOS
// =========================

// 1) /public (CSS, JS, imagens, assets)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 2) /uploads (AVATARES DO USUÁRIO)
//    Essa rota serve corretamente o diretório:
//      /public/uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// =========================
// ROTAS DE PÁGINAS
// =========================
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

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Cadastro de Usuário' });
});

app.get('/perfil', (req, res) => {
  res.render('perfil', { title: 'Meu Perfil' });
});

// =========================
// ROTAS API
// =========================
app.use('/auth', authRoutes);
app.use('/receitas', recipeRoutes);
app.use('/categorias', categoryRoutes);
app.use('/usuario', usuarioRoutes);

// =========================
// 404
// =========================
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

module.exports = app;
