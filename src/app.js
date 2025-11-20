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

// VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ESTÁTICOS
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);

// HOME – NÃO BUSCA MAIS RECEITAS DO BANCO
app.get('/', async (req, res) => {
  try {
    // se quiser manter categorias dinâmicas, mantém isso:
    const categoriasBD = await Category.findAll({
      order: [['name', 'ASC']],
    });

    // transforma em array de strings pra index.ejs
    const categorias = categoriasBD.map((c) => c.name);

    // NÃO PASSO MAIS NENHUMA RECEITA AQUI
    res.render('index', {
      title: 'Receita Tech',
      receitas: [],      // vazio -> nada publicado aparece na home
      categorias,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar a página inicial.');
  }
});

// PÁGINAS
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Cadastro de Usuário' });
});

app.get('/perfil', (req, res) => {
  res.render('perfil', { title: 'Meu Perfil' });
});

// ROTAS API
app.use('/auth', authRoutes);
app.use('/receitas', recipeRoutes);
app.use('/categorias', categoryRoutes);
app.use('/usuario', usuarioRoutes);

// 404
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

module.exports = app;
