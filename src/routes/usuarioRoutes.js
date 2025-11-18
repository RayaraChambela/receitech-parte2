const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.delete('/excluir', usuarioController.excluirConta);

module.exports = router;


