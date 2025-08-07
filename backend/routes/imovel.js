const verificarToken = require("../middlewares/verificarToken");
const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Imovel = require("../models/Imovel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuração do Multer para upload de imagens de imóveis
const imovelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/imoveis/"; // Relativo à raiz do backend
    // Cria o diretório se não existir (importante para o primeiro upload)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

const uploadImovel = multer({
  storage: imovelStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB por arquivo
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Erro: Apenas arquivos de imagem (jpeg, jpg, png, gif, webp) são permitidos!"));
  }
});

// Array de validações para criação e atualização de imóveis
const imovelValidationRules = () => {
  return [
    body("grupo").isInt({ min: 12, max: 18 }).withMessage("GRUPO deve ser um número entre 12 e 18."),
    body("bloco")
      .isString().trim().isLength({ min: 1, max: 1 }).isUppercase().isIn(["A", "B", "C", "D", "E", "F", "G"])
      .withMessage("BLOCO deve ser uma única letra maiúscula (A-G).")
      .custom((value, { req }) => {
        const grupo = parseInt(req.body.grupo);
        if (isNaN(grupo)) throw new Error("Grupo precisa ser um número para validar o bloco.");
        const isGrupoPar = grupo % 2 === 0;
        if (isGrupoPar && value === "G") throw new Error("Bloco G não é permitido para grupos pares.");
        if (!isGrupoPar && !["A", "B", "C", "D", "E", "F", "G"].includes(value)) throw new Error("Bloco inválido para grupo ímpar.");
        return true;
      }),
    body("andar").isInt().withMessage("ANDAR deve ser um número.")
      .custom((value, { req }) => {
        const andarNum = parseInt(value);
        const grupo = parseInt(req.body.grupo);
        if (isNaN(grupo)) throw new Error("Grupo precisa ser um número para validar o andar.");
        const isGrupoPar = grupo % 2 === 0;
        if (isGrupoPar && (andarNum < 1 || andarNum > 28)) throw new Error("Para GRUPO par, ANDAR deve ser entre 1 e 28.");
        if (!isGrupoPar && (andarNum < 1 || andarNum > 36)) throw new Error("Para GRUPO ímpar, ANDAR deve ser entre 1 e 36.");
        return true;
      }),
    body("apartamento").isInt().withMessage("APARTAMENTO deve ser um número.")
      .custom((value, { req }) => {
        const aptNum = parseInt(value);
        const andar = parseInt(req.body.andar);
        const grupo = parseInt(req.body.grupo);
        if (isNaN(grupo) || isNaN(andar)) throw new Error("Grupo e Andar precisam ser números para validar o apartamento.");
        const isGrupoPar = grupo % 2 === 0;
        let minApt, maxApt;
        if (isGrupoPar) { // 8 aptos por andar
          minApt = parseInt(String(andar) + "1");
          maxApt = parseInt(String(andar) + "8");
          if (aptNum < minApt || aptNum > maxApt) throw new Error(`Para GRUPO par, ANDAR ${andar}, APARTAMENTO deve ser entre ${minApt} e ${maxApt}. (Ex: Andar 1 -> 11 a 18, Andar 10 -> 101 a 108)`);
        } else { // 4 aptos por andar
          minApt = parseInt(String(andar) + "1");
          maxApt = parseInt(String(andar) + "4");
          if (aptNum < minApt || aptNum > maxApt) throw new Error(`Para GRUPO ímpar, ANDAR ${andar}, APARTAMENTO deve ser entre ${minApt} e ${maxApt}. (Ex: Andar 1 -> 11 a 14, Andar 10 -> 101 a 104)`);
        }
        return true;
      }),
    body("configuracaoPlanta").isString().isIn(["Padrão (2 dorms)", "2 dorms + Despensa", "2 dorms + Dependência", "Padrão (3 dorms)", "3 dorms + Dependência"]).withMessage("CONFIGURACAO_PLANTA inválida."),
    body("areaUtil").isNumeric().withMessage("AREA_UTIL deve ser um número.")
      .custom((value, { req }) => {
        const area = parseFloat(value);
        const config = req.body.configuracaoPlanta;
        const areasEsperadas = { "Padrão (2 dorms)": 82, "2 dorms + Despensa": 84, "2 dorms + Dependência": 86, "Padrão (3 dorms)": 125, "3 dorms + Dependência": 135 };
        if (areasEsperadas[config] !== undefined && area !== areasEsperadas[config]) throw new Error(`AREA_UTIL (${area}m²) não corresponde à CONFIGURACAO_PLANTA (${config} - ${areasEsperadas[config]}m²).`);
        if (areasEsperadas[config] === undefined) throw new Error("Configuração de planta não mapeada para área útil.");
        return true;
      }),
    body("numVagasGaragem").isInt({ min: 1, max: 3 }).withMessage("NUM_VAGAS_GARAGEM deve ser um número entre 1 e 3."),
    body("tipoVagaGaragem").isString().isIn(["Coberta", "Descoberta"]).withMessage("TIPO_VAGA_GARAGEM inválido.")
      .custom((value, { req }) => {
        const numVagas = parseInt(req.body.numVagasGaragem);
        if (isNaN(numVagas)) throw new Error("Número de vagas precisa ser informado para validar o tipo.");
        if (numVagas > 1 && value !== "Coberta") throw new Error("Para mais de uma vaga de garagem, o tipo deve ser Coberta.");
        return true;
      }),
    body("preco").isNumeric().custom((value) => parseFloat(value) > 0).withMessage("PRECO deve ser um número maior que zero."),
    body("statusAnuncio").isString().isIn(["Disponível para Venda", "Disponível para Locação"]).withMessage("STATUS_ANUNCIO inválido."),
  ];
};

// Middleware para tratar erros de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path || "geral"]: err.msg }));
  return res.status(422).json({ erros: extractedErrors });
};

// Rota GET para listar imóveis (acesso público para visitantes)
router.get("/", async (req, res) => {
  try {
    const filtro = {}; // Adicione seus filtros aqui se necessário
    const imoveis = await Imovel.find(filtro);
    res.json(imoveis);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ erro: "Erro ao buscar imóveis: " + err.message });
  }
});

// Rota POST para criar um novo imóvel
router.post("/", uploadImovel.array("imagens", 10), imovelValidationRules(), validate, async (req, res) => {
  try {
    const dadosImovel = { ...req.body };
    if (req.files && req.files.length > 0) {
      dadosImovel.imagens = req.files.map(file => file.path.replace(/\\/g, "/")); // Salva o caminho do arquivo
    }
    const novoImovel = new Imovel(dadosImovel);
    const imovelSalvo = await novoImovel.save();
    res.status(201).json(imovelSalvo);
  } catch (err) {
    console.error("Erro ao criar imóvel:", err);
    if (err.name === "ValidationError") return res.status(400).json({ erro: "Erro de validação: " + err.message, detalhes: err.errors });
    res.status(500).json({ erro: "Erro interno ao criar imóvel: " + err.message });
  }
});

// Rota para adicionar imóveis de teste (deve vir antes da rota /:id)
router.get("/seed", verificarToken, async (req, res) => {
  try {
    const count = await Imovel.countDocuments();
    if (count === 0) {
      // Dados de exemplo para os diferentes grupos
      const imoveisExemplo = [
        // Grupo 12 (par - 8 aptos por andar)
        {
          grupo: 12,
          bloco: "A",
          andar: 10,
          apartamento: 101,
          configuracaoPlanta: "Padrão (2 dorms)",
          areaUtil: 82,
          numVagasGaragem: 1,
          tipoVagaGaragem: "Coberta",
          preco: 320000,
          statusAnuncio: "Disponível para Venda"
        },
        {
          grupo: 12,
          bloco: "B",
          andar: 15,
          apartamento: 152,
          configuracaoPlanta: "2 dorms + Dependência",
          areaUtil: 86,
          numVagasGaragem: 1,
          tipoVagaGaragem: "Coberta",
          preco: 350000,
          statusAnuncio: "Disponível para Locação"
        },
        // Grupo 13 (ímpar - 4 aptos por andar)
        {
          grupo: 13,
          bloco: "C",
          andar: 20,
          apartamento: 203,
          configuracaoPlanta: "Padrão (3 dorms)",
          areaUtil: 125,
          numVagasGaragem: 2,
          tipoVagaGaragem: "Coberta",
          preco: 480000,
          statusAnuncio: "Disponível para Venda"
        },
        // Grupo 14 (par)
        {
          grupo: 14,
          bloco: "D",
          andar: 5,
          apartamento: 54,
          configuracaoPlanta: "2 dorms + Despensa",
          areaUtil: 84,
          numVagasGaragem: 1,
          tipoVagaGaragem: "Descoberta",
          preco: 310000,
          statusAnuncio: "Disponível para Locação"
        },
        // Grupo 15 (ímpar)
        {
          grupo: 15,
          bloco: "A",
          andar: 30,
          apartamento: 302,
          configuracaoPlanta: "3 dorms + Dependência",
          areaUtil: 135,
          numVagasGaragem: 2,
          tipoVagaGaragem: "Coberta",
          preco: 520000,
          statusAnuncio: "Disponível para Venda"
        },
        // Adicionar mais exemplos para cada grupo
        {
          grupo: 16,
          bloco: "F",
          andar: 18,
          apartamento: 186,
          configuracaoPlanta: "Padrão (2 dorms)",
          areaUtil: 82,
          numVagasGaragem: 1,
          tipoVagaGaragem: "Coberta",
          preco: 335000,
          statusAnuncio: "Disponível para Locação"
        },
        {
          grupo: 17,
          bloco: "G",
          andar: 25,
          apartamento: 251,
          configuracaoPlanta: "Padrão (3 dorms)",
          areaUtil: 125,
          numVagasGaragem: 1,
          tipoVagaGaragem: "Coberta",
          preco: 470000,
          statusAnuncio: "Disponível para Venda"
        },
        {
          grupo: 18,
          bloco: "E",
          andar: 12,
          apartamento: 127,
          configuracaoPlanta: "2 dorms + Despensa",
          areaUtil: 84,
          numVagasGaragem: 1,
          tipoVagaGaragem: "Coberta",
          preco: 345000,
          statusAnuncio: "Disponível para Locação"
        }
      ];
      
      await Imovel.insertMany(imoveisExemplo);
      res.json({ mensagem: "Imóveis de teste criados com sucesso!" });
    } else {
      res.json({ mensagem: `Já existem ${count} imóveis cadastrados.` });
    }
  } catch (err) {
    console.error("Erro ao criar imóveis de teste:", err);
    res.status(500).json({ erro: "Erro ao criar imóveis de teste: " + err.message });
  }
});

// Rota GET para buscar um imóvel por ID (acesso público para visitantes)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o ID tem formato válido do MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ erro: "Imóvel não encontrado. ID inválido." });
    }
    
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: "Imóvel não encontrado." });
    res.json(imovel);
  } catch (err) {
    console.error("Erro ao buscar imóvel por ID:", err);
    // Se for erro de cast (ID inválido), retornar 404 ao invés de 500
    if (err.name === 'CastError') {
      return res.status(404).json({ erro: "Imóvel não encontrado. ID inválido." });
    }
    res.status(500).json({ erro: "Erro ao buscar imóvel por ID: " + err.message });
  }
});

// Rota PUT para atualizar um imóvel por ID
router.put("/:id", uploadImovel.array("imagens", 10), imovelValidationRules(), validate, async (req, res) => {
  try {
    const dadosAtualizacao = { ...req.body };
    if (req.files && req.files.length > 0) {
      // Aqui você pode decidir se quer adicionar às imagens existentes ou substituí-las.
      // Este exemplo adiciona as novas e mantém as antigas se `req.body.imagens` já existir e for um array.
      // Para substituir, você buscaria o imóvel, removeria as imagens antigas do sistema de arquivos e atualizaria o array.
      const novasImagens = req.files.map(file => file.path.replace(/\\/g, "/"));
      // Se quiser substituir completamente as imagens antigas:
      // dadosAtualizacao.imagens = novasImagens;
      // Se quiser adicionar às existentes (precisaria carregar o imóvel primeiro para pegar as imagens antigas ou esperar que o frontend envie as antigas que devem ser mantidas):
      // Por simplicidade, vamos substituir por enquanto. O frontend precisaria reenviar as imagens que devem ser mantidas.
      dadosAtualizacao.imagens = novasImagens;
    } else if (dadosAtualizacao.imagens === undefined) {
        // Se o campo imagens não for enviado, não alteramos as imagens existentes.
        // Para remover todas as imagens, o frontend deve enviar um array vazio: "imagens": []
        delete dadosAtualizacao.imagens; 
    }


    const imovelAtualizado = await Imovel.findByIdAndUpdate(
      req.params.id,
      dadosAtualizacao,
      { new: true, runValidators: true }
    );
    if (!imovelAtualizado) return res.status(404).json({ erro: "Imóvel não encontrado para atualização." });
    res.json(imovelAtualizado);
  } catch (err) {
    console.error("Erro ao atualizar imóvel:", err);
    if (err.name === "ValidationError") return res.status(400).json({ erro: "Erro de validação: " + err.message, detalhes: err.errors });
    res.status(500).json({ erro: "Erro interno ao atualizar imóvel: " + err.message });
  }
});

// Rota DELETE para remover um imóvel por ID
router.delete("/:id", async (req, res) => {
  try {
    const imovel = await Imovel.findById(req.params.id);
    if (!imovel) return res.status(404).json({ erro: "Imóvel não encontrado para deletar." });

    // Opcional: Deletar as imagens do sistema de arquivos
    if (imovel.imagens && imovel.imagens.length > 0) {
      imovel.imagens.forEach(imgPath => {
        const fullPath = path.join(__dirname, "..", imgPath); // __dirname aponta para a pasta 'routes'
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`Imagem deletada: ${fullPath}`);
          } catch (unlinkErr) {
            console.error(`Erro ao deletar imagem ${fullPath}:`, unlinkErr);
          }
        }
      });
    }

    await Imovel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar imóvel:", err);
    res.status(500).json({ erro: "Erro interno ao deletar imóvel: " + err.message });
  }
});
module.exports = router;
