// backend/routes/asaasRoutes.js
const express = require('express');
const router = express.Router();
const asaasController = require('../controllers/asaasController');

// Criar cliente no Asaas
router.post("/api/asaas/cliente", asaasController.criarCliente);

// Criar cobrança (boleto) no Asaas
router.post("/api/asaas/cobranca", asaasController.criarCobranca);

// Listar boletos de um cliente
router.get("/api/asaas/boletos/:customerId", asaasController.listarBoletos);

// Baixar PDF do boleto
router.get("/api/asaas/pdf/:boletoId", asaasController.baixarBoletoPDF);

module.exports = router;
