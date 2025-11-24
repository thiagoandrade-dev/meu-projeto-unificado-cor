const express = require('express');
const router = express.Router();
const { proxyMessage } = require('../controllers/chatbotController');
const verificarToken = require('../middlewares/verificarToken');
const { body } = require('express-validator');

// Opcionalmente proteger por token para evitar abuso
router.post('/message', verificarToken, [
  body('message').trim().notEmpty().withMessage('message é obrigatório'),
  body('sessionId').optional().isString()
], proxyMessage);

module.exports = router;