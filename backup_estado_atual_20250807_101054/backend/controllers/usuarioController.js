// backend/controllers/usuarioController.js
const Inquilino = require("../models/Inquilino");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const { sendEmail, emailTemplates } = require("../config/emailConfig");

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.usuario.perfil !== "admin") {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem listar usuários." });
    }

    const usuarios = await Inquilino.find().select("-senha");
    const usuariosFormatados = usuarios.map(usuario => ({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      perfil: usuario.perfil,
      status: usuario.status,
      dataCadastro: usuario.dataCadastro || usuario.createdAt,
      ultimoAcesso: usuario.ultimoAcesso
    }));
    res.json(usuariosFormatados);
  } catch (error) {
    console.error("Erro ao listar usuários:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Buscar usuário por ID
const buscarUsuarioPorId = async (req, res) => {
  try {
    // Verificar se o usuário é admin ou está buscando seu próprio perfil
    if (req.usuario.perfil !== "admin" && req.usuario.id !== req.params.id) {
      return res.status(403).json({ erro: "Acesso negado. Você só pode acessar seu próprio perfil." });
    }

    const usuario = await Inquilino.findById(req.params.id).select("-senha");
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuarioFormatado = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      perfil: usuario.perfil,
      status: usuario.status,
      dataCadastro: usuario.dataCadastro || usuario.createdAt,
      ultimoAcesso: usuario.ultimoAcesso
    };

    res.json(usuarioFormatado);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Criar novo usuário (apenas admin pode criar)
const criarUsuario = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.usuario.perfil !== "admin") {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem criar usuários." });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array().map(err => ({ [err.path]: err.msg })) });
    }

    const { nome, email, senha, perfil = "inquilino", status = "ativo" } = req.body;

    if (await Inquilino.exists({ email })) {
      return res.status(400).json({ erro: "Email já cadastrado." });
    }

    const novoUsuario = await Inquilino.create({ 
      nome, 
      email, 
      senha, 
      perfil,
      status
    });
    
    res.status(201).json({
      mensagem: "Usuário criado com sucesso!",
      usuario: { 
        id: novoUsuario._id, 
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        status: novoUsuario.status
      }
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Atualizar usuário
const atualizarUsuario = async (req, res) => {
  try {
    // Verificar se o usuário é admin ou está atualizando seu próprio perfil
    if (req.usuario.perfil !== "admin" && req.usuario.id !== req.params.id) {
      return res.status(403).json({ erro: "Acesso negado. Você só pode atualizar seu próprio perfil." });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array().map(err => ({ [err.path]: err.msg })) });
    }

    const { nome, email, senha, perfil, status } = req.body;
    const dadosAtualizacao = {};

    // Apenas admin pode alterar perfil e status
    if (req.usuario.perfil === "admin") {
      if (perfil) dadosAtualizacao.perfil = perfil;
      if (status) dadosAtualizacao.status = status;
    }

    // Campos que qualquer usuário pode atualizar
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      dadosAtualizacao.senha = await bcrypt.hash(senha, salt);
    }

    const usuarioAtualizado = await Inquilino.findByIdAndUpdate(
      req.params.id,
      dadosAtualizacao,
      { new: true }
    ).select("-senha");

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuarioFormatado = {
      id: usuarioAtualizado._id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      telefone: usuarioAtualizado.telefone || "",
      perfil: usuarioAtualizado.perfil,
      status: usuarioAtualizado.status,
      dataCadastro: usuarioAtualizado.dataCadastro || usuarioAtualizado.createdAt,
      ultimoAcesso: usuarioAtualizado.ultimoAcesso
    };

    res.json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: usuarioFormatado
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Atualizar status do usuário (apenas admin)
const atualizarStatusUsuario = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.usuario.perfil !== "admin") {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem atualizar status." });
    }

    const { status } = req.body;
    if (!status || !["ativo", "inativo", "pendente"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido. Use 'ativo', 'inativo' ou 'pendente'." });
    }

    const usuarioAtualizado = await Inquilino.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-senha");

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuarioFormatado = {
      id: usuarioAtualizado._id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      telefone: usuarioAtualizado.telefone || "",
      perfil: usuarioAtualizado.perfil,
      status: usuarioAtualizado.status,
      dataCadastro: usuarioAtualizado.dataCadastro || usuarioAtualizado.createdAt,
      ultimoAcesso: usuarioAtualizado.ultimoAcesso
    };

    res.json({
      mensagem: "Status do usuário atualizado com sucesso!",
      usuario: usuarioFormatado
    });
  } catch (erro) {
    console.error("Erro ao atualizar status do usuário:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

// Excluir usuário (apenas admin)
const excluirUsuario = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.usuario.perfil !== "admin") {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem excluir usuários." });
    }

    const usuarioExcluido = await Inquilino.findByIdAndDelete(req.params.id);
    if (!usuarioExcluido) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json({ mensagem: "Usuário excluído com sucesso!" });
  } catch (erro) {
    console.error("Erro ao excluir usuário:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
};

// Solicitar reset de senha para um usuário (apenas admin)
const solicitarResetSenha = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.usuario.perfil !== "admin") {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem solicitar reset de senha." });
    }

    const { id } = req.params;

    // Buscar o usuário
    const usuario = await Inquilino.findById(id);
    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // Gerar token de redefinição
    const token = crypto.randomBytes(20).toString("hex");
    const expiracao = Date.now() + 3600000; // 1 hora

    // Salvar token e expiração no usuário
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = expiracao;
    await usuario.save();

    // URL de redefinição (frontend)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:8081"}/redefinir-senha/${token}`;

    // Usar template de e-mail centralizado
    const emailTemplate = emailTemplates.resetPassword(resetUrl, usuario.nome);
    
    // Enviar email usando a configuração centralizada
    await sendEmail({
      to: usuario.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({ 
      mensagem: `Email de redefinição de senha enviado para ${usuario.email}`,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error.message);
    res.status(500).json({ erro: `Erro ao processar solicitação de reset de senha: ${error.message}` });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  atualizarStatusUsuario,
  excluirUsuario,
  solicitarResetSenha
};

