// backend/routes/usuario.js
const router = require("express").Router();
const { body } = require("express-validator");
const usuarioController = require("../controllers/usuarioController");
const verificarToken = require("../middlewares/verificarToken");

// Validações
const usuarioValidationRules = () => [
  body("nome").trim().notEmpty().withMessage("O nome é obrigatório."),
  body("email").isEmail().withMessage("Email inválido.").normalizeEmail(),
  body("senha").optional().isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres."),
  body("perfil").optional().isIn(["admin", "inquilino", "proprietario", "corretor"]).withMessage("Perfil inválido."),
  body("status").optional().isIn(["ativo", "inativo", "pendente"]).withMessage("Status inválido.")
];

// Rotas protegidas por autenticação
router.use(verificarToken);

// Listar todos os usuários (apenas admin)
router.get("/", usuarioController.listarUsuarios);

// Buscar usuário por ID
router.get("/:id", usuarioController.buscarUsuarioPorId);

// Criar novo usuário (apenas admin)
router.post("/", usuarioValidationRules(), usuarioController.criarUsuario);

// Atualizar usuário
router.put("/:id", usuarioValidationRules(), usuarioController.atualizarUsuario);

// Atualizar status do usuário (apenas admin)
router.patch("/:id/status", usuarioController.atualizarStatusUsuario);

// Excluir usuário (apenas admin)
router.delete("/:id", usuarioController.excluirUsuario);

// Solicitar reset de senha para um usuário (apenas admin)
router.post("/:id/reset-senha", usuarioController.solicitarResetSenha);

module.exports = router;

