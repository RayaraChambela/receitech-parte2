// src/models/Recipe.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prep_time_min: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
  },
  servings: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'recipes',
});

module.exports = Recipe;
