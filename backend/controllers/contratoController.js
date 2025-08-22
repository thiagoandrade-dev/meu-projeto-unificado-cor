// backend/controllers/contratoController.js
const Contrato = require("../models/Contrato");
const Inquilino = require("../models/Inquilino");
const Imovel = require("../models/Imovel");
const path = require('path');
const fs = require('fs');
const { validationResult } = require("express-validator");

// Listar todos os contratos
const listarContratos = async (req, res) => {
  try {
    const filtros = {};
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    
    // Aplicar filtros se fornecidos
    if (req.query.status) filtros.status = req.query.status;
    if (req.query.tipo) filtros.tipo = req.query.tipo;
    if (req.query.inquilinoId) filtros.inquilinoId = req.query.inquilinoId;
    if (req.query.imovelId) filtros.imovelId = req.query.imovelId;
    
    // Buscar contratos com populate para trazer dados relacionados
    const contratos = await Contrato.find(filtros)
      .populate('inquilinoId', 'nome email telefone cpf rg')
      .populate('imovelId', 'grupo bloco andar apartamento configuracaoPlanta endereco')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
      
    // Contar o total para paginação  
    const total = await Contrato.countDocuments(filtros);
    
    res.json({
      data: contratos,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao listar contratos:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Buscar contrato por ID
const buscarContratoPorId = async (req, res) => {
  try {
    const contrato = await Contrato.findById(req.params.id)
      .populate('inquilinoId', 'nome email telefone cpf rg endereco')
      .populate('imovelId', 'grupo bloco andar apartamento configuracaoPlanta endereco');
      
    if (!contrato) {
      return res.status(404).json({ erro: "Contrato não encontrado." });
    }

    res.json(contrato);
  } catch (error) {
    console.error("Erro ao buscar contrato:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Criar novo contrato
const criarContrato = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array().map(err => ({ [err.path]: err.msg })) });
    }

    const {
      numero,
      inquilinoId,
      imovelId,
      dataInicio,
      dataFim,
      valorAluguel,
      valorCondominio,
      valorIPTU,
      diaVencimento,
      observacoes,
      proximoVencimento,
      dataUltimoReajuste,
      percentualReajusteAnual,
      indiceReajuste
    } = req.body;

    // Se um arquivo foi enviado, salvar o caminho
    let arquivoContrato = null;
    if (req.file) {
      arquivoContrato = req.file.path.replace(/\\/g, "/");
    }

    // Verificar se inquilino e imóvel existem
    const inquilino = await Inquilino.findById(inquilinoId);
    if (!inquilino) {
      return res.status(400).json({ erro: "Inquilino não encontrado." });
    }

    const imovel = await Imovel.findById(imovelId);
    if (!imovel) {
      return res.status(400).json({ erro: "Imóvel não encontrado." });
    }

    // Verificar se já existe contrato ativo para o imóvel
    const contratoExistente = await Contrato.findOne({
      imovelId,
      status: { $in: ['ativo', 'pendente'] }
    });

    if (contratoExistente) {
      return res.status(400).json({ erro: "Já existe um contrato ativo para este imóvel." });
    }

    const novoContrato = await Contrato.create({
      numero,
      inquilinoId,
      imovelId,
      dataInicio,
      dataFim,
      valorAluguel,
      valorCondominio,
      valorIPTU,
      diaVencimento,
      observacoes,
      proximoVencimento,
      dataUltimoReajuste,
      percentualReajusteAnual,
      indiceReajuste,
      arquivoContrato,
      status: 'ativo'
    });

    const contratoPopulado = await Contrato.findById(novoContrato._id)
      .populate('inquilinoId', 'nome email telefone cpf rg')
      .populate('imovelId', 'grupo bloco andar apartamento configuracaoPlanta endereco');
    
    res.status(201).json({
      mensagem: "Contrato criado com sucesso!",
      contrato: contratoPopulado
    });
  } catch (error) {
    console.error("Erro ao criar contrato:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Atualizar contrato
const atualizarContrato = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array().map(err => ({ [err.path]: err.msg })) });
    }

    const {
      numero,
      inquilinoId,
      imovelId,
      dataInicio,
      dataFim,
      valorAluguel,
      valorCondominio,
      valorIPTU,
      diaVencimento,
      observacoes,
      proximoVencimento,
      dataUltimoReajuste,
      percentualReajusteAnual,
      indiceReajuste,
      arquivoContrato,
      status
    } = req.body;

    const dadosAtualizacao = {};

    // Se um novo arquivo foi enviado, atualizar o caminho
    if (req.file) {
      dadosAtualizacao.arquivoContrato = req.file.path.replace(/\/g, "/");
    }

    if (numero) dadosAtualizacao.numero = numero;
    if (inquilinoId) dadosAtualizacao.inquilinoId = inquilinoId;
    if (imovelId) dadosAtualizacao.imovelId = imovelId;
    if (dataInicio) dadosAtualizacao.dataInicio = dataInicio;
    if (dataFim) dadosAtualizacao.dataFim = dataFim;
    if (valorAluguel) dadosAtualizacao.valorAluguel = valorAluguel;
    if (valorCondominio !== undefined) dadosAtualizacao.valorCondominio = valorCondominio;
    if (valorIPTU !== undefined) dadosAtualizacao.valorIPTU = valorIPTU;
    if (diaVencimento) dadosAtualizacao.diaVencimento = diaVencimento;
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (proximoVencimento) dadosAtualizacao.proximoVencimento = proximoVencimento;
    if (dataUltimoReajuste) dadosAtualizacao.dataUltimoReajuste = dataUltimoReajuste;
    if (percentualReajusteAnual !== undefined) dadosAtualizacao.percentualReajusteAnual = percentualReajusteAnual;
    if (indiceReajuste) dadosAtualizacao.indiceReajuste = indiceReajuste;
    if (arquivoContrato) dadosAtualizacao.arquivoContrato = arquivoContrato;
    if (status) dadosAtualizacao.status = status;

    const contratoAtualizado = await Contrato.findByIdAndUpdate(
      req.params.id,
      dadosAtualizacao,
      { new: true }
    ).populate('inquilinoId', 'nome email telefone cpf rg')
     .populate('imovelId', 'grupo bloco andar apartamento configuracaoPlanta endereco');

    if (!contratoAtualizado) {
      return res.status(404).json({ erro: "Contrato não encontrado." });
    }

    res.json({
      mensagem: "Contrato atualizado com sucesso!",
      contrato: contratoAtualizado
    });
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Excluir contrato
const excluirContrato = async (req, res) => {
  try {
    const contratoExcluido = await Contrato.findByIdAndDelete(req.params.id);
    if (!contratoExcluido) {
      return res.status(404).json({ erro: "Contrato não encontrado." });
    }

    res.json({ mensagem: "Contrato excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir contrato:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Atualizar status do contrato
const atualizarStatusContrato = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["ativo", "inativo", "vencido", "finalizado", "pendente"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido. Use 'ativo', 'inativo', 'vencido', 'finalizado' ou 'pendente'." });
    }

    const contratoAtualizado = await Contrato.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('inquilinoId', 'nome email telefone cpf rg')
     .populate('imovelId', 'grupo bloco andar apartamento configuracaoPlanta endereco');

    if (!contratoAtualizado) {
      return res.status(404).json({ erro: "Contrato não encontrado." });
    }

    res.json({
      mensagem: "Status do contrato atualizado com sucesso!",
      contrato: contratoAtualizado
    });
  } catch (error) {
    console.error("Erro ao atualizar status do contrato:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Download de arquivo de contrato
const downloadContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const { perfil, id: usuarioId } = req.user;

    const contrato = await Contrato.findById(id);
    if (!contrato) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contrato não encontrado' 
      });
    }

    // Verificar permissões
    if (perfil !== 'admin' && contrato.inquilinoId.toString() !== usuarioId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado' 
      });
    }

    if (!contrato.arquivoContrato) {
      return res.status(404).json({ 
        success: false, 
        message: 'Arquivo de contrato não encontrado' 
      });
    }

    const filePath = path.resolve(contrato.arquivoContrato);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Arquivo físico não encontrado' 
      });
    }

    // Definir o nome do arquivo para download
    const fileName = `contrato-${contrato.numero || contrato._id}.${path.extname(filePath).substring(1)}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Enviar o arquivo
    res.sendFile(filePath);

  } catch (error) {
    console.error('Erro ao fazer download do contrato:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

module.exports = {
  listarContratos,
  buscarContratoPorId,
  criarContrato,
  atualizarContrato,
  excluirContrato,
  atualizarStatusContrato,
  downloadContrato
};