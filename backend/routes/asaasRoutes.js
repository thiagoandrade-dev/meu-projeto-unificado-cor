// backend/routes/asaasRoutes.js
const express = require('express');
const router = express.Router();
const asaasController = require('../controllers/asaasController');

// Criar cliente no Asaas
router.post('/asaas/clientes', asaasController.criarCliente);

// Criar cobrança (boleto) no Asaas
router.post('/asaas/cobrancas', asaasController.criarCobranca);

// Listar boletos de um cliente
router.get('/asaas/boletos/:customerId', asaasController.listarBoletos);

// Baixar PDF do boleto
router.get('/asaas/boletos/pdf/:boletoId', asaasController.baixarBoletoPDF);

module.exports = router;
