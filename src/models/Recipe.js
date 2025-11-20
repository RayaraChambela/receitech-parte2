// src/models/Recipe.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  // usuário dono da receita
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  // título da receita (nome)
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  // slug gerado automaticamente
  slug: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true,
  },

  // sobre a receita
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // categoria e subcategoria
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  // ingredientes / preparo (arrays)
  ingredients: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
  },

  // tempo de preparo
  prep_time_min: {
    type: DataTypes.STRING(50), // pode ser "30 min", "1h15", etc
    allowNull: true,
  },

  // dica do chef
  tip: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // porções (não obrigatório)
  servings: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
  },

  // imagem de capa
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  // info do autor
  author_name: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  author_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
  }

}, {
  tableName: 'recipes',
});

module.exports = Recipe;
