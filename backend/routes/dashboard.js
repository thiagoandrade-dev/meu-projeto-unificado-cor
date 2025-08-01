// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificarToken = require('../middlewares/verificarToken');

// As rotas não precisam do prefixo /api/dashboard aqui, pois ele será adicionado no server.js
router.get('/', verificarToken, dashboardController.getDashboardCompleto); // Esta rota se tornará /api/dashboard

// Rotas individuais para cada tipo de dado.
router.get('/estatisticas', verificarToken, dashboardController.getEstatisticas); // Esta rota se tornará /api/dashboard/estatisticas
router.get('/receita-mensal', verificarToken, dashboardController.getReceitaMensal);
router.get('/ocupacao', verificarToken, dashboardController.getOcupacao);
router.get('/receita-por-tipo', verificarToken, dashboardController.getReceitaPorTipoImovel);
router.get('/receita-por-categoria', verificarToken, dashboardController.getReceitaPorCategoria);
router.get('/alertas', verificarToken, dashboardController.getAlertas);
router.get('/proximos-vencimentos', verificarToken, dashboardController.getProximosVencimentos);

module.exports = router;