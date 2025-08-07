const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const verificarToken = require('../middlewares/verificarToken');

// Todas as rotas de relatório requerem autenticação
router.use(verificarToken);

// Gerar relatório financeiro
router.post('/financeiro', relatorioController.gerarRelatorioFinanceiro);

// Gerar relatório de imóveis
router.post('/imoveis', relatorioController.gerarRelatorioImoveis);

// Gerar relatório de contratos
router.post('/contratos', relatorioController.gerarRelatorioContratos);

// Gerar relatório de inquilinos
router.post('/inquilinos', relatorioController.gerarRelatorioInquilinos);

// Gerar relatório jurídico
router.post('/juridico', relatorioController.gerarRelatorioJuridico);

// Enviar relatório por email
router.post('/enviar-email', relatorioController.enviarRelatorioPorEmail);

module.exports = router;