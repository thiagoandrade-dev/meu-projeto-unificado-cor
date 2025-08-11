// backend/routes/notificacaoAutomaticaRoutes.js
const express = require('express');
const router = express.Router();
const notificacaoAutomaticaController = require('../controllers/notificacaoAutomaticaController');

// 📊 Status e controle do sistema
router.get('/status', notificacaoAutomaticaController.obterStatus);
router.post('/iniciar', notificacaoAutomaticaController.iniciarSistema);
router.post('/parar', notificacaoAutomaticaController.pararSistema);
router.post('/verificar-manual', notificacaoAutomaticaController.executarVerificacaoManual);

// 📋 Informações do sistema
router.get('/tipos', notificacaoAutomaticaController.listarTiposNotificacao);

// 🧪 Endpoints para teste (desenvolvimento)
router.post('/testar/parabens', notificacaoAutomaticaController.testarParabens);
router.post('/testar/boas-vindas', notificacaoAutomaticaController.testarBoasVindas);
router.post('/testar/vencimento-aluguel', notificacaoAutomaticaController.testarLembreteVencimento);
router.post('/testar/reajuste', notificacaoAutomaticaController.testarReajuste);
router.post('/testar/vencimento-contrato', notificacaoAutomaticaController.testarVencimentoContrato);

module.exports = router;