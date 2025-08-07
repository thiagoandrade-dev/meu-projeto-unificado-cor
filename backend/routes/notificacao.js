// backend/routes/notificacao.js
const router = require("express").Router();
const notificacaoController = require("../controllers/notificacaoController");
const verificarToken = require("../middlewares/verificarToken");

// Todas as rotas requerem autenticação
router.use(verificarToken);

// Rotas para notificações no sistema
router.get("/", notificacaoController.getAll);
router.post("/", notificacaoController.create);
router.patch("/:id/read", notificacaoController.markAsRead);
router.delete("/:id", notificacaoController.deleteNotification);

// Rotas para envio de emails
router.post("/email", notificacaoController.sendEmail);
router.post("/cobrancas-lote", notificacaoController.enviarCobrancasLote);
router.post("/lembretes-vencimento", notificacaoController.criarLembretesVencimento);
router.post("/juridico", notificacaoController.enviarNotificacaoJuridica);

module.exports = router;

