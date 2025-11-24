// backend/routes/asaasRoutes.js
const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const { body } = require('express-validator');
const asaasController = require('../controllers/asaasController');

// Criar cliente no Asaas
router.post("/asaas/cliente", verificarToken, [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('cpfCnpj').optional().isString(),
  body('celular').optional().isString(),
  body('inquilinoId').optional().isMongoId()
], asaasController.criarCliente);

// Criar cobrança (boleto) no Asaas
router.post("/asaas/cobranca", verificarToken, [
  body('customerId').trim().notEmpty().withMessage('customerId é obrigatório'),
  body('valor').isNumeric().withMessage('valor deve ser numérico'),
  body('vencimento').isISO8601().withMessage('vencimento inválido'),
  body('descricao').optional().isString()
], asaasController.criarCobranca);

// Listar boletos de um cliente
router.get("/asaas/boletos/:customerId", verificarToken, asaasController.listarBoletos);

// Baixar PDF do boleto
router.get("/asaas/pdf/:boletoId", verificarToken, asaasController.baixarBoletoPDF);

module.exports = router;
