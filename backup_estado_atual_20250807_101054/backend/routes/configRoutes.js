const express = require('express');
const router = express.Router();
const { 
  getEmailConfig, 
  saveEmailConfig, 
  testEmailConfig 
} = require('../controllers/configController');
const auth = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas para configurações de e-mail
router.get('/email', getEmailConfig);
router.post('/email', saveEmailConfig);
router.post('/email/test', testEmailConfig);

module.exports = router;