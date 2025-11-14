// src/models/RecipeCategory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeCategory = sequelize.define('RecipeCategory', {
  recipe_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
  },
}, {
  tableName: 'recipe_categories',
  timestamps: false,
});

module.exports = RecipeCategory;
