// backend/controllers/esqueceuSenhaController.js
const Inquilino = require("../models/Inquilino");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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

    // Configurar email
    const mailOptions = {
      to: usuario.email,
      from: process.env.EMAIL_FROM || "noreply@imobiliariafirenze.com.br",
      subject: "Redefinição de Senha - Imobiliária Firenze",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Redefinição de Senha</h2>
          <p>Olá ${usuario.nome},</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Senha</a>
          </div>
          <p>Se você não solicitou esta redefinição, por favor ignore este email ou entre em contato conosco.</p>
          <p>Este link é válido por 1 hora.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">Imobiliária Firenze - Todos os direitos reservados.</p>
        </div>
      `
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

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

