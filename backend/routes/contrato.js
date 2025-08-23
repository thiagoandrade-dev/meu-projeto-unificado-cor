const verificarToken = require("../middlewares/verificarToken");
const router = require("express").Router();
const contratoController = require("../controllers/contratoController");
const Contrato = require("../models/Contrato");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para upload de contratos
const contratoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/contratos/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Nome do arquivo: contrato-{timestamp}-{nome-original}
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `contrato-${timestamp}-${originalName}`);
  }
});

const uploadContrato = multer({
  storage: contratoStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB por arquivo
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Erro: Apenas arquivos PDF, DOC ou DOCX são permitidos para contratos!"));
  }
});

// Validações
const contratoValidationRules = () => [
  body("numero").trim().notEmpty().withMessage("O número do contrato é obrigatório."),
  body("inquilinoId").isMongoId().withMessage("ID do inquilino inválido."),
  body("imovelId").isMongoId().withMessage("ID do imóvel inválido."),
  body("dataInicio").isISO8601().withMessage("Data de início inválida."),
  body("dataFim").isISO8601().withMessage("Data de fim inválida."),
  body("valorAluguel").isNumeric().withMessage("Valor do aluguel deve ser numérico."),
  body("diaVencimento").optional().isInt({ min: 1, max: 31 }).withMessage("Dia de vencimento deve ser entre 1 e 31."),
  body("percentualReajusteAnual").optional().isNumeric().withMessage("Percentual de reajuste deve ser numérico."),
  body("indiceReajuste").optional().isIn(["IGPM", "IPCA", "INCC", "Outro"]).withMessage("Índice de reajuste inválido.")
];

// Rotas protegidas por autenticação
router.use(verificarToken);

// Listar todos os contratos
router.get("/", contratoController.listarContratos);

// Buscar contrato por ID
router.get("/:id", contratoController.buscarContratoPorId);

// Criar novo contrato
router.post("/", uploadContrato.single('arquivoContrato'), contratoValidationRules(), contratoController.criarContrato);

// Atualizar contrato
router.put("/:id", uploadContrato.single('arquivoContrato'), contratoValidationRules(), contratoController.atualizarContrato);

// Atualizar status do contrato
router.patch("/:id/status", contratoController.atualizarStatusContrato);

// Excluir contrato
router.delete("/:id", contratoController.excluirContrato);

// Download de contrato
router.get("/:id/download", contratoController.downloadContrato);

// Sincronizar status dos imóveis com base nos contratos
router.post("/sincronizar-status-imoveis", contratoController.sincronizarStatusImoveis);

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