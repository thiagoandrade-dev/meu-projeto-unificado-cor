// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificarToken = require('../middlewares/verificarToken');

// MUDANÇA AQUI: Removido '/api/dashboard' do prefixo da rota.
// A rota final será /api/dashboard quando montada no server.js
router.get('/', verificarToken, dashboardController.getDashboardCompleto);

// Rotas individuais para cada tipo de dado.
// MUDANÇA AQUI: Removido '/api/dashboard' dos prefixos.
router.get('/estatisticas', verificarToken, dashboardController.getEstatisticas);
router.get('/receita-mensal', verificarToken, dashboardController.getReceitaMensal);
router.get('/ocupacao', verificarToken, dashboardController.getOcupacao);
router.get('/receita-por-tipo', verificarToken, dashboardController.getReceitaPorTipoImovel);
router.get('/receita-por-categoria', verificarToken, dashboardController.getReceitaPorCategoria);
router.get('/alertas', verificarToken, dashboardController.getAlertas);
router.get('/proximos-vencimentos', verificarToken, dashboardController.getProximosVencimentos);

module.exports = router;