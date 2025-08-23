// backend/controllers/imovelController.js
const Imovel = require('../models/Imovel');
const Contrato = require('../models/Contrato');
const Inquilino = require('../models/Inquilino');
const { validationResult } = require('express-validator');

/**
 * Finalizar venda de imóvel
 * Marca o imóvel como vendido e mantém histórico
 */
const finalizarVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      compradorNome,
      compradorCpf,
      compradorEmail,
      compradorTelefone,
      valorVenda,
      dataVenda,
      observacoes,
      documentosEntregues = []
    } = req.body;

    // Validar dados obrigatórios
    if (!compradorNome || !compradorCpf || !valorVenda || !dataVenda) {
      return res.status(400).json({
        erro: 'Dados obrigatórios: compradorNome, compradorCpf, valorVenda, dataVenda'
      });
    }

    // Buscar o imóvel
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }

    // Verificar se o imóvel pode ser vendido
    if (imovel.statusAnuncio === 'Vendido') {
      return res.status(400).json({ erro: 'Imóvel já foi vendido' });
    }

    if (imovel.statusAnuncio === 'Locado Ativo') {
      return res.status(400).json({ 
        erro: 'Não é possível vender imóvel com locação ativa. Finalize a locação primeiro.' 
      });
    }

    // Criar histórico de venda
    const historicoVenda = {
      tipo: 'venda',
      data: new Date(dataVenda),
      comprador: {
        nome: compradorNome,
        cpf: compradorCpf,
        email: compradorEmail,
        telefone: compradorTelefone
      },
      valorVenda: parseFloat(valorVenda),
      observacoes: observacoes || '',
      documentosEntregues: documentosEntregues,
      dataRegistro: new Date(),
      usuarioResponsavel: req.user?.id || 'Sistema'
    };

    // Atualizar o imóvel
    const imovelAtualizado = await Imovel.findByIdAndUpdate(
      id,
      {
        statusAnuncio: 'Vendido',
        dataStatusAtual: new Date(),
        observacoesStatus: `Vendido para ${compradorNome} em ${new Date(dataVenda).toLocaleDateString('pt-BR')}`,
        contratoId: null, // Limpar referência de contrato se houver
        $push: {
          historico: historicoVenda
        }
      },
      { new: true }
    );

    res.status(200).json({
      mensagem: 'Venda finalizada com sucesso',
      imovel: imovelAtualizado,
      historicoVenda
    });

  } catch (error) {
    console.error('Erro ao finalizar venda:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Reverter venda de imóvel
 * Permite desfazer uma venda e retornar o imóvel ao status anterior
 */
const reverterVenda = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo, novoStatus = 'Disponível para Venda' } = req.body;

    // Buscar o imóvel
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }

    // Verificar se o imóvel está vendido
    if (imovel.statusAnuncio !== 'Vendido') {
      return res.status(400).json({ erro: 'Imóvel não está vendido' });
    }

    // Validar novo status
    const statusPermitidos = [
      'Disponível para Venda',
      'Disponível para Locação',
      'Indisponível',
      'Em Reforma'
    ];

    if (!statusPermitidos.includes(novoStatus)) {
      return res.status(400).json({ 
        erro: 'Status inválido',
        statusPermitidos 
      });
    }

    // Criar registro de reversão no histórico
    const historicoReversao = {
      tipo: 'reversao_venda',
      data: new Date(),
      motivo: motivo || 'Reversão de venda',
      statusAnterior: 'Vendido',
      novoStatus: novoStatus,
      dataRegistro: new Date(),
      usuarioResponsavel: req.user?.id || 'Sistema'
    };

    // Atualizar o imóvel
    const imovelAtualizado = await Imovel.findByIdAndUpdate(
      id,
      {
        statusAnuncio: novoStatus,
        dataStatusAtual: new Date(),
        observacoesStatus: `Venda revertida: ${motivo || 'Sem motivo especificado'}`,
        $push: {
          historico: historicoReversao
        }
      },
      { new: true }
    );

    res.status(200).json({
      mensagem: 'Venda revertida com sucesso',
      imovel: imovelAtualizado,
      historicoReversao
    });

  } catch (error) {
    console.error('Erro ao reverter venda:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Obter histórico completo de um imóvel
 */
const obterHistorico = async (req, res) => {
  try {
    const { id } = req.params;

    const imovel = await Imovel.findById(id)
      .populate('contratoId')
      .select('grupo bloco andar apartamento statusAnuncio dataStatusAtual observacoesStatus historico');

    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado' });
    }

    // Buscar todos os contratos relacionados ao imóvel
    const contratos = await Contrato.find({ imovelId: id })
      .populate('inquilinoId', 'nome cpf email telefone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      imovel: {
        _id: imovel._id,
        identificacao: `Grupo ${imovel.grupo} - Bloco ${imovel.bloco} - Apto ${imovel.apartamento}`,
        statusAtual: imovel.statusAnuncio,
        dataStatusAtual: imovel.dataStatusAtual,
        observacoesStatus: imovel.observacoesStatus
      },
      historico: imovel.historico || [],
      contratos: contratos.map(contrato => ({
        _id: contrato._id,
        codigo: contrato.codigo,
        tipo: contrato.tipo,
        status: contrato.status,
        dataInicio: contrato.dataInicio,
        dataFim: contrato.dataFim,
        valorAluguel: contrato.valorAluguel,
        inquilino: contrato.inquilinoId ? {
          nome: contrato.inquilinoId.nome,
          cpf: contrato.inquilinoId.cpf,
          email: contrato.inquilinoId.email,
          telefone: contrato.inquilinoId.telefone
        } : null,
        createdAt: contrato.createdAt
      }))
    });

  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

/**
 * Listar imóveis vendidos com filtros
 */
const listarImoveisVendidos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      dataInicio,
      dataFim,
      valorMin,
      valorMax
    } = req.query;

    const skip = (page - 1) * limit;

    // Construir query de filtros
    const matchQuery = {
      statusAnuncio: 'Vendido',
      'historico.tipo': 'venda'
    };

    // Filtro de busca
    if (search) {
      matchQuery.$or = [
        { 'grupo': { $regex: search, $options: 'i' } },
        { 'bloco': { $regex: search, $options: 'i' } },
        { 'apartamento': { $regex: search, $options: 'i' } },
        { 'historico.comprador.nome': { $regex: search, $options: 'i' } },
        { 'historico.comprador.cpf': { $regex: search, $options: 'i' } }
      ];
    }

    // Filtros de data e valor serão aplicados no aggregate
    const pipeline = [
      { $match: matchQuery },
      { $unwind: '$historico' },
      { $match: { 'historico.tipo': 'venda' } }
    ];

    // Filtro de data
    if (dataInicio || dataFim) {
      const dateFilter = {};
      if (dataInicio) dateFilter.$gte = new Date(dataInicio);
      if (dataFim) dateFilter.$lte = new Date(dataFim);
      pipeline.push({ $match: { 'historico.data': dateFilter } });
    }

    // Filtro de valor
    if (valorMin || valorMax) {
      const valueFilter = {};
      if (valorMin) valueFilter.$gte = parseFloat(valorMin);
      if (valorMax) valueFilter.$lte = parseFloat(valorMax);
      pipeline.push({ $match: { 'historico.valorVenda': valueFilter } });
    }

    // Projeção e ordenação
    pipeline.push(
      {
        $project: {
          _id: 1,
          grupo: 1,
          bloco: 1,
          andar: 1,
          apartamento: 1,
          areaUtil: 1,
          statusAnuncio: 1,
          dataStatusAtual: 1,
          observacoesStatus: 1,
          venda: '$historico'
        }
      },
      { $sort: { 'venda.data': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const imoveisVendidos = await Imovel.aggregate(pipeline);

    // Contar total para paginação
    const countPipeline = [
      { $match: matchQuery },
      { $unwind: '$historico' },
      { $match: { 'historico.tipo': 'venda' } }
    ];

    if (dataInicio || dataFim) {
      const dateFilter = {};
      if (dataInicio) dateFilter.$gte = new Date(dataInicio);
      if (dataFim) dateFilter.$lte = new Date(dataFim);
      countPipeline.push({ $match: { 'historico.data': dateFilter } });
    }

    if (valorMin || valorMax) {
      const valueFilter = {};
      if (valorMin) valueFilter.$gte = parseFloat(valorMin);
      if (valorMax) valueFilter.$lte = parseFloat(valorMax);
      countPipeline.push({ $match: { 'historico.valorVenda': valueFilter } });
    }

    countPipeline.push({ $count: 'total' });
    const countResult = await Imovel.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Calcular estatísticas
    const estatisticas = await Imovel.aggregate([
      { $match: { statusAnuncio: 'Vendido', 'historico.tipo': 'venda' } },
      { $unwind: '$historico' },
      { $match: { 'historico.tipo': 'venda' } },
      {
        $group: {
          _id: null,
          totalVendas: { $sum: 1 },
          valorTotalVendas: { $sum: '$historico.valorVenda' },
          valorMedioVenda: { $avg: '$historico.valorVenda' },
          valorMinimoVenda: { $min: '$historico.valorVenda' },
          valorMaximoVenda: { $max: '$historico.valorVenda' }
        }
      }
    ]);

    const stats = estatisticas[0] || {
      totalVendas: 0,
      valorTotalVendas: 0,
      valorMedioVenda: 0,
      valorMinimoVenda: 0,
      valorMaximoVenda: 0
    };

    res.status(200).json({
      imoveis: imoveisVendidos,
      paginacao: {
        paginaAtual: parseInt(page),
        totalPaginas: totalPages,
        totalItens: totalCount,
        itensPorPagina: parseInt(limit)
      },
      estatisticas: {
        totalVendas: stats.totalVendas,
        valorTotalVendas: Math.round(stats.valorTotalVendas * 100) / 100,
        valorMedioVenda: Math.round(stats.valorMedioVenda * 100) / 100,
        valorMinimoVenda: Math.round(stats.valorMinimoVenda * 100) / 100,
        valorMaximoVenda: Math.round(stats.valorMaximoVenda * 100) / 100
      }
    });

  } catch (error) {
    console.error('Erro ao listar imóveis vendidos:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message
    });
  }
};

module.exports = {
  finalizarVenda,
  reverterVenda,
  obterHistorico,
  listarImoveisVendidos
};