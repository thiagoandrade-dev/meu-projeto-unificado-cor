// Local: backend/routes/notificacao.routes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/verificarToken'); // Middleware de autenticação

// Importa a função que acabamos de criar no controller
const notificacaoController = require('../controllers/notificacao.controller');

// Define a rota: quando uma requisição POST chegar em /api/notificacoes/send,
// execute a função 'sendNotification' do nosso controller.
router.post('/send', auth, notificacaoController.sendNotification);

module.exports = router;