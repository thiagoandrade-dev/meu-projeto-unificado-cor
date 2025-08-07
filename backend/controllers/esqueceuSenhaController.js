// backend/controllers/esqueceuSenhaController.js
const Inquilino = require("../models/Inquilino");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendEmail, emailTemplates } = require("../config/emailConfig");

// Solicitar redefinição de senha
const solicitarRedefinicao = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o email existe
    const usuario = await Inquilino.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ erro: "Email não encontrado." });
    }

    // Gerar token de redefinição
    const token = crypto.randomBytes(20).toString("hex");
    const expiracao = Date.now() + 3600000; // 1 hora

    // Salvar token e expiração no usuário
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = expiracao;
    await usuario.save();

    // URL de redefinição (frontend)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/redefinir-senha/${token}`;

    // Usar template de e-mail centralizado
    const emailTemplate = emailTemplates.resetPassword(resetUrl, usuario.nome);
    
    // Enviar email usando a configuração centralizada
    await sendEmail({
      to: usuario.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({ mensagem: "Email de redefinição enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error.message);
    res.status(500).json({ erro: `Erro ao processar solicitação de redefinição de senha: ${error.message}` });
  }
};

// Verificar token de redefinição
const verificarToken = async (req, res) => {
  try {
    const { token } = req.params;

    const usuario = await Inquilino.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ erro: "Token inválido ou expirado." });
    }

    res.json({ mensagem: "Token válido", email: usuario.email });
  } catch (error) {
    console.error("Erro ao verificar token:", error.message);
    res.status(500).json({ erro: `Erro ao verificar token de redefinição: ${error.message}` });
  }
};

// Redefinir senha
const redefinirSenha = async (req, res) => {
  try {
    const { token } = req.params;
    const { senha } = req.body;

    if (!senha || senha.length < 6) {
      return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
    }

    const usuario = await Inquilino.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ erro: "Token inválido ou expirado." });
    }

    // Atualizar senha
    const salt = await bcrypt.genSalt(10);
    usuario.senha = await bcrypt.hash(senha, salt);
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();

    res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error.message);
    res.status(500).json({ erro: `Erro ao redefinir senha: ${error.message}` });
  }
};

module.exports = {
  solicitarRedefinicao,
  verificarToken,
  redefinirSenha
};

