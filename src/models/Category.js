// src/models/Category.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // tabela não tem updated_at
});

module.exports = Category;
