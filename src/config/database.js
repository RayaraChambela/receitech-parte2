// src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,   // web_receitas
  process.env.DB_USER,   // root
  process.env.DB_PASS,   // sua senha
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    logging: false, // põe true se quiser ver os SQLs
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = sequelize;
