// src/controllers/recipe.controller.js
const { Recipe } = require('../db');

/**
 * Gera um slug básico a partir do título
 */
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .normalize('NFD')                 // remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')      // troca tudo que não é letra/número por -
    .replace(/(^-|-$)/g, '');         // tira - do começo/fim

  return `${base}-${Date.now()}`;
}

/**
 * POST /receitas
 * Criação de receita
 */
exports.create = async (req, res) => {
  try {
    const {
      title,
      category,
      subcategory,
      description,
      ingredients,
      steps,
      prep_time_min,
      tip,
      author_name,
      author_email,
      servings,
      user_id,        // virá do front, se quiser usar
    } = req.body;

    // pega o user id do body ou fixa em 1 se não vier
    const userId = user_id || 1;

    // valida campos mínimos
    if (!title || !category || !description) {
      return res
        .status(400)
        .json({ error: 'Título, categoria e descrição são obrigatórios.' });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ error: 'Usuário da receita não informado.' });
    }

    // trata imagem (multer preenche req.file)
    let coverImage = null;
    if (req.file) {
      // se vier via .single('image')
      coverImage = `/uploads/recipes/${req.file.filename}`;
    } else if (req.files && req.files.length > 0) {
      // se vier via .any()
      coverImage = `/uploads/recipes/${req.files[0].filename}`;
    }

    // converte ingredientes e passos (vêm como JSON.stringfy([]) do front)
    let ingredientsArr = [];
    let stepsArr = [];

    try {
      if (ingredients) ingredientsArr = JSON.parse(ingredients);
      if (steps) stepsArr = JSON.parse(steps);
    } catch (e) {
      return res
        .status(400)
        .json({ error: 'Formato inválido de ingredientes ou modo de preparo.' });
    }

    if (!Array.isArray(ingredientsArr) || ingredientsArr.length === 0) {
      return res
        .status(400)
        .json({ error: 'Informe pelo menos um ingrediente.' });
    }

    if (!Array.isArray(stepsArr) || stepsArr.length === 0) {
      return res
        .status(400)
        .json({ error: 'Informe pelo menos uma etapa de preparo.' });
    }

    // gera slug único
    const slug = generateSlug(title);

    const recipe = await Recipe.create({
      user_id: userId,
      title,
      slug,
      description,
      category,
      subcategory: subcategory || null,
      ingredients: ingredientsArr,
      steps: stepsArr,
      prep_time_min: prep_time_min || null,
      tip: tip || null,
      servings: servings || null,
      cover_image: coverImage,
      author_name: author_name || null,
      author_email: author_email || null,
    });

    // front espera { recipe: { id: ... } }
    return res.status(201).json({ recipe });
  } catch (err) {
    console.error('Erro ao criar receita:', err);
    return res.status(500).json({ error: 'Erro ao criar receita.' });
  }
};

/**
 * GET /receitas/:id
 * Mostra a receita em uma página
 */
// src/controllers/recipe.controller.js
exports.show = async (req, res) => {
  try {
    const id = req.params.id;

    const recipeInstance = await Recipe.findByPk(id);

    if (!recipeInstance) {
      return res.status(404).send('Receita não encontrada.');
    }

    // transforma em objeto puro
    const recipe = recipeInstance.toJSON();

    // helper para garantir que vira array
    const normalizeFieldToArray = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;

      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn('Não consegui fazer JSON.parse em:', field);
          return [];
        }
      }

      return [];
    };

    recipe.ingredients = normalizeFieldToArray(recipe.ingredients);
    recipe.steps = normalizeFieldToArray(recipe.steps);

    return res.render('receita', {
      title: recipe.title,
      recipe,
    });
  } catch (err) {
    console.error('Erro ao carregar receita:', err);
    return res.status(500).send('Erro ao carregar receita.');
  }
};


/**
 * (Opcional) listar receitas em uma página de lista
 */
exports.list = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      order: [['id', 'DESC']],
    });

    return res.render('lista-receitas', {
      title: 'Receitas',
      recipes,
    });
  } catch (err) {
    console.error('Erro ao listar receitas:', err);
    return res.status(500).send('Erro ao listar receitas.');
  }
};

/**
 * GET /receitas/usuario/:userId
 * Retorna as receitas de um usuário específico (JSON)
 */
exports.listByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
    }

    const recipes = await Recipe.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    return res.json({ recipes });
  } catch (err) {
    console.error('Erro ao listar receitas do usuário:', err);
    return res.status(500).json({ error: 'Erro ao listar receitas do usuário.' });
  }
};
