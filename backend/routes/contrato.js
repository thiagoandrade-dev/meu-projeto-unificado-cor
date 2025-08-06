const verificarToken = require("../middlewares/verificarToken");
const router = require("express").Router();
const Contrato = require("../models/Contrato");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

// Rota GET para listar contratos com paginação e filtros
router.get("/", verificarToken, async (req, res) => {
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
      .populate('inquilinoId', 'nome email telefone')
      .populate('imovelId', 'grupo bloco andar apartamento configuracaoPlanta')
      .sort({ createdAt: -1 }) // Mais recentes primeiro
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
  } catch (err) {
    console.error("Erro ao buscar contratos:", err);
    res.status(500).json({ erro: "Erro ao buscar contratos: " + err.message });
  }
});

// Se não houver contratos no banco de dados, vamos adicionar alguns para teste
router.get("/seed", verificarToken, async (req, res) => {
  try {
    const count = await Contrato.countDocuments();
    if (count === 0) {
      // Buscar IDs de inquilinos e imóveis existentes
      const inquilinos = await mongoose.model('Inquilino').find().limit(5);
      const imoveis = await mongoose.model('Imovel').find().limit(5);
      
      if (inquilinos.length === 0 || imoveis.length === 0) {
        return res.status(400).json({
          erro: "Não há inquilinos ou imóveis cadastrados para criar contratos de teste"
        });
      }
      
      // Criar alguns contratos de teste
      const contratosBase = [
        {
          codigo: "CTR2023001",
          tipo: "Locação",
          status: "Ativo",
          dataInicio: new Date("2023-01-15"),
          dataFim: new Date("2024-01-14"),
          duracaoMeses: 12,
          valorAluguel: 1800.00,
          observacoes: "Contrato padrão de locação"
        },
        {
          codigo: "CTR2023002",
          tipo: "Locação",
          status: "Ativo",
          dataInicio: new Date("2023-02-01"),
          dataFim: new Date("2024-01-31"),
          duracaoMeses: 12,
          valorAluguel: 2200.00,
          observacoes: "Inclui taxa de condomínio"
        },
        {
          codigo: "CTR2023003",
          tipo: "Venda",
          status: "Finalizado",
          dataInicio: new Date("2023-03-10"),
          dataFim: new Date("2023-03-10"),
          duracaoMeses: 1,
          valorAluguel: 350000.00,
          observacoes: "Venda à vista"
        },
        {
          codigo: "CTR2023004",
          tipo: "Locação",
          status: "Vencido",
          dataInicio: new Date("2022-06-01"),
          dataFim: new Date("2023-05-31"),
          duracaoMeses: 12,
          valorAluguel: 1950.00,
          observacoes: "Aguardando renovação"
        },
        {
          codigo: "CTR2023005",
          tipo: "Locação",
          status: "Pendente",
          dataInicio: new Date("2023-06-15"),
          dataFim: new Date("2024-06-14"),
          duracaoMeses: 12,
          valorAluguel: 2100.00,
          observacoes: "Aguardando assinatura"
        }
      ];
      
      // Adicionar referências de inquilinos e imóveis
      const contratos = contratosBase.map((contrato, index) => ({
        ...contrato,
        inquilinoId: inquilinos[index % inquilinos.length]._id,
        imovelId: imoveis[index % imoveis.length]._id
      }));
      
      await Contrato.insertMany(contratos);
      res.json({ mensagem: "Contratos de teste criados com sucesso!" });
    } else {
      res.json({ mensagem: `Já existem ${count} contratos cadastrados.` });
    }
  } catch (err) {
    console.error("Erro ao criar contratos de teste:", err);
    res.status(500).json({ erro: "Erro ao criar contratos de teste: " + err.message });
  }
});

// Outras rotas do CRUD de contratos seriam adicionadas aqui

module.exports = router;