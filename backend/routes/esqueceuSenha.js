// backend/routes/esqueceuSenha.js
const router = require("express").Router();
const { body } = require("express-validator");
const esqueceuSenhaController = require("../controllers/esqueceuSenhaController");

// Solicitar redefinição de senha
router.post("/solicitar", [
  body("email").isEmail().withMessage("Email inválido.").normalizeEmail()
], esqueceuSenhaController.solicitarRedefinicao);

// Verificar token de redefinição
router.get("/verificar/:token", esqueceuSenhaController.verificarToken);

// Redefinir senha
router.post("/redefinir/:token", [
  body("senha").isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres.")
], esqueceuSenhaController.redefinirSenha);

module.exports = router;

