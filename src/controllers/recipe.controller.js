// src/controllers/recipe.controller.js
const { Recipe, Comment, User } = require('../db');

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
exports.show = async (req, res) => {
  try {
    const id = req.params.id;

    // 1) Busca só a receita
    const recipeInstance = await Recipe.findByPk(id);

    if (!recipeInstance) {
      return res.status(404).send('Receita não encontrada.');
    }

    const recipe = recipeInstance.toJSON();

    // 2) Busca o usuário dono da receita (se tiver user_id)
    let author = null;
    if (recipe.user_id) {
      author = await User.findByPk(recipe.user_id, {
        attributes: ['id', 'name', 'avatar_url'],
      });
    }

    // helper para normalizar arrays
    const normalizeFieldToArray = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;

      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch (e) {
          return [field];
        }
      }
      return [];
    };

    recipe.ingredients = normalizeFieldToArray(recipe.ingredients);
    recipe.steps = normalizeFieldToArray(recipe.steps);

    // 3) Comentários
    const comments = await Comment.findAll({
      where: { recipe_id: id },
      order: [['created_at', 'ASC']],
    });

    // 4) Renderiza já passando nome + avatar do autor
    return res.render('receita', {
      title: recipe.title,
      recipe: {
        ...recipe,
        author_name: author?.name || recipe.author_name || 'Autor desconhecido',
        author_avatar: author?.avatar_url || null,
      },
      comments,
    });

  } catch (err) {
    console.error('Erro ao carregar receita:', err);
    return res.status(500).send('Erro ao carregar receita.');
  }
};




/**
 * GET /receitas/:id/editar
 * Mostra formulário para editar a receita
 */
exports.editForm = async (req, res) => {
  try {
    const id = req.params.id;

    const recipeInstance = await Recipe.findByPk(id);
    if (!recipeInstance) {
      return res.status(404).send('Receita não encontrada.');
    }

    const recipe = recipeInstance.toJSON();

    const normalizeFieldToArray = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;

      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch (e) {
          return [field];
        }
      }
      return [];
    };

    const ingredientes = normalizeFieldToArray(recipe.ingredients);
    const passos = normalizeFieldToArray(recipe.steps);

    return res.render('editar-receita', {
      title: `Editar: ${recipe.title}`,
      recipe,
      ingredientes,
      passos,
    });
  } catch (err) {
    console.error('Erro ao carregar formulário de edição:', err);
    return res.status(500).send('Erro ao carregar formulário de edição.');
  }
};



// POST /receitas/:id/comentarios
exports.addComment = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { user_id, author_name, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comentário não pode ser vazio.' });
    }

    if (!user_id || !author_name) {
      return res.status(400).json({ error: 'Dados do usuário são obrigatórios.' });
    }

    const comment = await Comment.create({
      recipe_id: recipeId,
      user_id,
      author_name,
      content: content.trim(),
    });

    return res.status(201).json({ comment });
  } catch (err) {
    console.error('Erro ao criar comentário:', err);
    return res.status(500).json({ error: 'Erro ao criar comentário.' });
  }
};

// PUT /receitas/:id/comentarios/:commentId
exports.updateComment = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const commentId = req.params.commentId;
    const { user_id, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comentário não pode ser vazio.' });
    }

    const comment = await Comment.findByPk(commentId);

    if (!comment || String(comment.recipe_id) !== String(recipeId)) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }

    // 🔒 Só o dono pode editar
    if (String(comment.user_id) !== String(user_id)) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este comentário.' });
    }

    comment.content = content.trim();
    await comment.save();

    return res.json({ comment });
  } catch (err) {
    console.error('Erro ao atualizar comentário:', err);
    return res.status(500).json({ error: 'Erro ao atualizar comentário.' });
  }
};

// DELETE /receitas/:id/comentarios/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const commentId = req.params.commentId;
    const { user_id } = req.body;

    const comment = await Comment.findByPk(commentId);

    if (!comment || String(comment.recipe_id) !== String(recipeId)) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }

    // 🔒 Só o dono pode excluir
    if (String(comment.user_id) !== String(user_id)) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este comentário.' });
    }

    await comment.destroy();

    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir comentário:', err);
    return res.status(500).json({ error: 'Erro ao excluir comentário.' });
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

/**
 * PUT /receitas/:id
 * Atualiza uma receita (servidor confere se o user é o dono)
 * OBS: aqui só deixei preparado; você pode ligar isso à tela de edição depois
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      category,
      subcategory,
      description,
      ingredients,
      steps,
      prep_time_min,
      tip,
      servings,
      user_id,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Usuário não informado.' });
    }

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Receita não encontrada.' });
    }

    // 🔒 Só o dono pode editar
    if (String(recipe.user_id) !== String(user_id)) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta receita.' });
    }

    let ingredientsArr = recipe.ingredients;
    let stepsArr = recipe.steps;

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

    recipe.title = title ?? recipe.title;
    recipe.category = category ?? recipe.category;
    recipe.subcategory = subcategory ?? recipe.subcategory;
    recipe.description = description ?? recipe.description;
    recipe.ingredients = ingredientsArr;
    recipe.steps = stepsArr;
    recipe.prep_time_min = prep_time_min ?? recipe.prep_time_min;
    recipe.tip = tip ?? recipe.tip;
    recipe.servings = servings ?? recipe.servings;

    await recipe.save();

    return res.json({ recipe });
  } catch (err) {
    console.error('Erro ao atualizar receita:', err);
    return res.status(500).json({ error: 'Erro ao atualizar receita.' });
  }
};

/**
 * DELETE /receitas/:id
 * Exclui uma receita (só o autor)
 */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Usuário não informado.' });
    }

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Receita não encontrada.' });
    }

    // 🔒 Só o dono pode excluir
    if (String(recipe.user_id) !== String(user_id)) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta receita.' });
    }

    await recipe.destroy();

    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir receita:', err);
    return res.status(500).json({ error: 'Erro ao excluir receita.' });
  }
};
