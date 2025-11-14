const sequelize = require('../config/database');
const Category = require('../models/Category');
const Recipe   = require('../models/Recipe');
const User     = require('../models/User');

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao MySQL via Sequelize');
  } catch (err) {
    console.error('❌ Erro ao conectar no MySQL:', err.message);
  }
}

initDb();

module.exports = {
  sequelize,
  Category,
  Recipe,
  User,
};
