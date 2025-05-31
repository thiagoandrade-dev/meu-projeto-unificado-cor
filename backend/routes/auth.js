const router = require("express").Router();
const Inquilino = require("../models/Inquilino");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// Validações
const registerValidationRules = () => [
  body("nome").trim().notEmpty().withMessage("O nome é obrigatório."),
  body("email").isEmail().withMessage("Email inválido.").normalizeEmail(),
  body("senha").isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres."),
  body("perfil").optional().isIn(["admin", "inquilino"]).withMessage("Perfil inválido.")
];

const validateAuth = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erros: errors.array().map(err => ({ [err.path]: err.msg })) });
  }
  next();
};

// Rotas
router.post("/register", registerValidationRules(), validateAuth, async (req, res) => {
  try {
    const { nome, email, senha, perfil = "inquilino" } = req.body; // Default para inquilino

    if (await Inquilino.exists({ email })) {
      return res.status(400).json({ erro: "Email já cadastrado." });
    }

    const novoInquilino = await Inquilino.create({ nome, email, senha, perfil });
    
    res.status(201).json({
      mensagem: "Usuário registrado com sucesso!",
      usuario: { 
        id: novoInquilino._id, 
        nome: novoInquilino.nome,
        email: novoInquilino.email,
        perfil: novoInquilino.perfil
      }
    });

  } catch (erro) {
    console.error("Erro no registro:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// CORRIGIDO: Alterado de "/login.html" para "/login"
router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("senha").exists()
], async (req, res) => {
  try {
    console.log("Tentativa de login recebida:", req.body.email); // Log para depuração
    
    // Validação básica
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erro: "Dados inválidos." });
    }

    const { email, senha } = req.body;
    const usuario = await Inquilino.findOne({ email }).select("+senha"); // Garante que a senha seja retornada

    if (!usuario) {
      console.log("Usuário não encontrado:", email); // Log para depuração
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }
    
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      console.log("Senha incorreta para:", email); // Log para depuração
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    console.log("Login bem-sucedido para:", email, "- Perfil:", usuario.perfil); // Log para depuração

    // Token JWT
    const token = jwt.sign(
      { 
        id: usuario._id,
        perfil: usuario.perfil 
      },
      process.env.JWT_SECRET || "default_secret_use_env_var_in_prod", // AVISO importante
      { expiresIn: "8h" } // Tempo maior de expiração
    );

    // Resposta padronizada
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });

  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

module.exports = router;