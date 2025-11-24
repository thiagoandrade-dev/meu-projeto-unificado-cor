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
      codigo,
      tipo,
      inquilinoId,
      imovelId,
      dataInicio,
      dataFim,
      duracaoMeses,
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
      const { cloudinary } = require('../config/cloudinaryConfig');
      const uploadResult = await new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const originalName = (req.file.originalname || 'contrato').replace(/[^a-zA-Z0-9.-]/g, '_');
        const publicId = `contratos/${inquilinoId || 'unknown'}/${timestamp}_${originalName}`;
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'raw', public_id: publicId }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(req.file.buffer);
      });
      arquivoContrato = uploadResult.secure_url;
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
      status: { $in: ['Ativo', 'Pendente'] }
    });

    if (contratoExistente) {
      return res.status(400).json({ erro: "Já existe um contrato ativo para este imóvel." });
    }

    const novoContrato = await Contrato.create({
      codigo,
      tipo,
      inquilinoId,
      imovelId,
      dataInicio,
      dataFim,
      duracaoMeses,
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
      status: 'Ativo'
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
      codigo,
      tipo,
      inquilinoId,
      imovelId,
      dataInicio,
      dataFim,
      duracaoMeses,
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
      const { cloudinary } = require('../config/cloudinaryConfig');
      const uploadResult = await new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const originalName = (req.file.originalname || 'contrato').replace(/[^a-zA-Z0-9.-]/g, '_');
        const publicId = `contratos/${req.params.id}/${timestamp}_${originalName}`;
        const stream = cloudinary.uploader.upload_stream({ resource_type: 'raw', public_id: publicId }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(req.file.buffer);
      });
      dadosAtualizacao.arquivoContrato = uploadResult.secure_url;
    }

    if (codigo) dadosAtualizacao.codigo = codigo;
    if (tipo) dadosAtualizacao.tipo = tipo;
    if (inquilinoId) dadosAtualizacao.inquilinoId = inquilinoId;
    if (imovelId) dadosAtualizacao.imovelId = imovelId;
    if (dataInicio) dadosAtualizacao.dataInicio = dataInicio;
    if (dataFim) dadosAtualizacao.dataFim = dataFim;
    if (duracaoMeses) dadosAtualizacao.duracaoMeses = duracaoMeses;
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
    if (status) {
      const map = {
        ativo: 'Ativo',
        pendente: 'Pendente',
        vencido: 'Vencido',
        rescindido: 'Rescindido',
        finalizado: 'Finalizado',
        Ativo: 'Ativo',
        Pendente: 'Pendente',
        Vencido: 'Vencido',
        Rescindido: 'Rescindido',
        Finalizado: 'Finalizado',
      };
      const normalized = map[status];
      if (!normalized) {
        return res.status(400).json({ erro: "Status inválido. Use 'Ativo', 'Pendente', 'Vencido', 'Rescindido' ou 'Finalizado'." });
      }
      dadosAtualizacao.status = normalized;
    }

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
    const map = {
      ativo: 'Ativo',
      pendente: 'Pendente',
      vencido: 'Vencido',
      rescindido: 'Rescindido',
      finalizado: 'Finalizado',
      Ativo: 'Ativo',
      Pendente: 'Pendente',
      Vencido: 'Vencido',
      Rescindido: 'Rescindido',
      Finalizado: 'Finalizado',
    };
    const normalized = map[status];
    if (!normalized) {
      return res.status(400).json({ erro: "Status inválido. Use 'Ativo', 'Pendente', 'Vencido', 'Rescindido' ou 'Finalizado'." });
    }

    const contratoAtualizado = await Contrato.findByIdAndUpdate(
      req.params.id,
      { status: normalized },
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
    const usuario = req.usuario || {};
    const perfil = usuario.perfil;
    const usuarioId = usuario.id;

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

    if (/^https?:\/\//i.test(contrato.arquivoContrato)) {
      return res.redirect(302, contrato.arquivoContrato);
    }
    const filePath = path.resolve(contrato.arquivoContrato);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Arquivo físico não encontrado' });
    }
    const fileName = `contrato-${contrato.codigo || contrato._id}.${path.extname(filePath).substring(1)}`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
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

// Sincronizar status dos imóveis com base nos contratos
const sincronizarStatusImoveis = async (req, res) => {
  try {
    const contratos = await Contrato.find({}).populate('imovelId');
    const imoveis = await Imovel.find({});
    let atualizacoes = 0;
    let erros = [];

    for (const imovel of imoveis) {
      try {
        // Buscar contrato ativo para este imóvel
        const contratoAtivo = contratos.find(c => 
          c.imovelId && 
          c.imovelId._id.toString() === imovel._id.toString() && 
          c.status === 'Ativo'
        );

        // Buscar contrato pendente se não houver ativo
        const contratoPendente = contratos.find(c => 
          c.imovelId && 
          c.imovelId._id.toString() === imovel._id.toString() && 
          c.status === 'Pendente'
        );

        let novoStatus = null;
        let contratoId = null;
        let observacoes = '';

        if (contratoAtivo) {
          if (contratoAtivo.tipo === 'Locação') {
            novoStatus = 'Locado Ativo';
          } else if (contratoAtivo.tipo === 'Venda') {
            novoStatus = 'Vendido';
          }
          contratoId = contratoAtivo._id;
          observacoes = `Sincronizado com contrato ${contratoAtivo.codigo}`;
        } else if (contratoPendente) {
          novoStatus = 'Reservado';
          contratoId = contratoPendente._id;
          observacoes = `Reservado - contrato ${contratoPendente.codigo} pendente`;
        } else {
          // Sem contratos ativos ou pendentes
          if (imovel.statusAnuncio === 'Locado Ativo' || 
              imovel.statusAnuncio === 'Vendido' || 
              imovel.statusAnuncio === 'Reservado') {
            // Determinar status baseado no último tipo de contrato ou padrão
            const ultimoContrato = contratos
              .filter(c => c.imovelId && c.imovelId._id.toString() === imovel._id.toString())
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            
            if (ultimoContrato) {
              novoStatus = ultimoContrato.tipo === 'Locação' ? 'Disponível para Locação' : 'Disponível para Venda';
            } else {
              novoStatus = 'Disponível para Locação'; // Padrão
            }
            contratoId = null;
            observacoes = 'Disponibilizado automaticamente - sem contratos ativos';
          }
        }

        // Atualizar apenas se necessário
        if (novoStatus && (imovel.statusAnuncio !== novoStatus || imovel.contratoId?.toString() !== contratoId?.toString())) {
          await Imovel.findByIdAndUpdate(imovel._id, {
            statusAnuncio: novoStatus,
            contratoId: contratoId,
            dataStatusAtual: new Date(),
            observacoesStatus: observacoes
          });
          atualizacoes++;
        }
      } catch (error) {
        erros.push({
          imovelId: imovel._id,
          erro: error.message
        });
      }
    }

    res.json({
      mensagem: 'Sincronização concluída',
      atualizacoes,
      totalImoveis: imoveis.length,
      erros: erros.length > 0 ? erros : undefined
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({
      erro: 'Erro interno na sincronização',
      detalhes: error.message
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
  downloadContrato,
  sincronizarStatusImoveis
};
