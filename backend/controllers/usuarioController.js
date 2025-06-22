// backend/controllers/usuarioController.js
const Inquilino = require("../models/Inquilino");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.usuario.perfil !== "admin") {
      return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem listar usuários." });
    }

    const usuarios = await Inquilino.find().select("-senha");
    res.json(usuarios);
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

    res.json(usuario);
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

    const { nome, email, senha, perfil = "inquilino", status = "Ativo" } = req.body;

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

    res.json({
      mensagem: "Usuário atualizado com sucesso!",
      usuario: usuarioAtualizado
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
    if (!status || !["Ativo", "Inativo"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido. Use 'Ativo' ou 'Inativo'." });
    }

    const usuarioAtualizado = await Inquilino.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-senha");

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json({
      mensagem: "Status do usuário atualizado com sucesso!",
      usuario: usuarioAtualizado
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

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  atualizarStatusUsuario,
  excluirUsuario
};

