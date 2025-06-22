// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificarToken = require('../middlewares/verificarToken');

// Rota para obter todas as estatísticas do dashboard
router.get('/api/dashboard', verificarToken, dashboardController.getDashboardCompleto);

// Rotas individuais para cada tipo de dado
router.get('/api/dashboard/estatisticas', verificarToken, dashboardController.getEstatisticas);
router.get('/api/dashboard/receita-mensal', verificarToken, dashboardController.getReceitaMensal);
router.get('/api/dashboard/ocupacao', verificarToken, dashboardController.getOcupacao);
router.get('/api/dashboard/receita-por-tipo', verificarToken, dashboardController.getReceitaPorTipoImovel);
router.get('/api/dashboard/receita-por-categoria', verificarToken, dashboardController.getReceitaPorCategoria);
router.get('/api/dashboard/alertas', verificarToken, dashboardController.getAlertas);
router.get('/api/dashboard/proximos-vencimentos', verificarToken, dashboardController.getProximosVencimentos);

module.exports = router;

