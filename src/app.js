// src/app.js
const path = require('path');
const express = require('express');

const app = express();

// Models / Sequelize
const { Recipe, sequelize } = require('./db');

// Helper de tempo
const { formatTempo } = require('./utils/tempo');

// Rotas
const recipeRoutes = require('./routes/recipe.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const pesquisaRoutes = require('./routes/resultado-pesquisa.routes.');

// =======================
// VIEW ENGINE
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// helper disponível em TODAS as views
app.locals.formatTempo = formatTempo;

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// ARQUIVOS ESTÁTICOS
// =======================
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);

// =======================
// HOME – RECEITAS MAIS COMENTADAS
// =======================
app.get('/', async (req, res) => {
  try {
    // mesmas categorias da dropdown
    const categorias = [
      'Bolos e tortas',
      'Carnes',
      'Aves',
      'Peixes e frutos do mar',
      'Saladas e molhos',
      'Sopas',
      'Massas',
      'Bebidas',
      'Lanches',
      'Doces e sobremesas',
      'Alimentação saudável',
    ];

    const receitas = await Recipe.findAll({
      attributes: [
        'id',
        ['title', 'titulo'],
        ['cover_image', 'imagem'],
        ['prep_time_min', 'tempo'],
        ['category', 'categoria'],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM comments c WHERE c.recipe_id = Recipe.id)'
          ),
          'totalComentarios',
        ],
      ],
      order: [
        [sequelize.literal('totalComentarios'), 'DESC'],
        ['id', 'DESC'],
      ],
      limit: 4,
      raw: true,
    });

    res.render('index', {
      title: 'Receita Tech',
      receitas,
      categorias,
    });
  } catch (err) {
    console.error('Erro ao carregar a página inicial:', err);
    res.status(500).send('Erro ao carregar a página inicial.');
  }
});

// =======================
// PÁGINAS
// =======================
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Cadastro de Usuário' });
});

app.get('/perfil', (req, res) => {
  res.render('perfil', { title: 'Meu Perfil' });
});

// =======================
// ROTAS API
// =======================
app.use('/auth', authRoutes);
app.use('/receitas', recipeRoutes);
app.use('/categorias', categoryRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/pesquisa', pesquisaRoutes);

// =======================
// 404
// =======================
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

module.exports = app;
