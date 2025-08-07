// Script para criar dados de exemplo de imóveis baseados na estrutura correta do condomínio
require("dotenv").config();
const mongoose = require("mongoose");
const Imovel = require("../models/Imovel");

const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";

const seedImoveis = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Conectado ao MongoDB para seeding de imóveis...");

    // Limpar todos os imóveis existentes
    await Imovel.deleteMany({});
    console.log("Todos os imóveis existentes foram removidos.");

    // Estrutura correta:
    // Grupos PARES (12, 14, 16, 18): 6 torres (blocos A-F)
    // Grupos ÍMPARES (13, 15, 17): 7 torres (blocos A-G)

    const imoveisExemplo = [
      // GRUPO 12 (PAR) - Blocos A-F
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
        apartamento: 151,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 350000,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 12,
        bloco: "C",
        andar: 8,
        apartamento: 82,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 325000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 12,
        bloco: "D",
        andar: 12,
        apartamento: 121,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 340000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 12,
        bloco: "E",
        andar: 5,
        apartamento: 51,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Descoberta",
        preco: 310000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 12,
        bloco: "F",
        andar: 18,
        apartamento: 181,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 345000,
        statusAnuncio: "Disponível para Locação"
      },

      // GRUPO 13 (ÍMPAR) - Blocos A-G
      {
        grupo: 13,
        bloco: "A",
        andar: 20,
        apartamento: 201,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 480000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 13,
        bloco: "B",
        andar: 25,
        apartamento: 251,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 520000,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 13,
        bloco: "C",
        andar: 22,
        apartamento: 221,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 470000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 13,
        bloco: "D",
        andar: 18,
        apartamento: 182,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 515000,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 13,
        bloco: "E",
        andar: 30,
        apartamento: 301,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 490000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 13,
        bloco: "F",
        andar: 28,
        apartamento: 281,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 530000,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 13,
        bloco: "G",
        andar: 26,
        apartamento: 261,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 485000,
        statusAnuncio: "Disponível para Venda"
      },

      // GRUPO 14 (PAR) - Blocos A-F
      {
        grupo: 14,
        bloco: "A",
        andar: 7,
        apartamento: 71,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 315000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 14,
        bloco: "B",
        andar: 9,
        apartamento: 92,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 330000,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 14,
        bloco: "C",
        andar: 11,
        apartamento: 113,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 345000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 14,
        bloco: "D",
        andar: 13,
        apartamento: 131,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 335000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 14,
        bloco: "E",
        andar: 16,
        apartamento: 162,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 355000,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 14,
        bloco: "F",
        andar: 19,
        apartamento: 191,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 365000,
        statusAnuncio: "Disponível para Venda"
      },

      // GRUPO 15 (ÍMPAR) - Blocos A-G
      {
        grupo: 15,
        bloco: "A",
        andar: 14,
        apartamento: 141,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 475000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 15,
        bloco: "G",
        andar: 32,
        apartamento: 321,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 545000,
        statusAnuncio: "Disponível para Locação"
      },

      // GRUPO 16 (PAR) - Blocos A-F
      {
        grupo: 16,
        bloco: "A",
        andar: 6,
        apartamento: 61,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 318000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 16,
        bloco: "F",
        andar: 17,
        apartamento: 172,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 368000,
        statusAnuncio: "Disponível para Locação"
      },

      // GRUPO 17 (ÍMPAR) - Blocos A-G
      {
        grupo: 17,
        bloco: "C",
        andar: 23,
        apartamento: 231,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 478000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 17,
        bloco: "G",
        andar: 29,
        apartamento: 291,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 535000,
        statusAnuncio: "Disponível para Locação"
      },

      // GRUPO 18 (PAR) - Blocos A-F
      {
        grupo: 18,
        bloco: "B",
        andar: 4,
        apartamento: 42,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 322000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 18,
        bloco: "E",
        andar: 21,
        apartamento: 212,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 372000,
        statusAnuncio: "Disponível para Locação"
      }
    ];

    await Imovel.insertMany(imoveisExemplo);
    console.log(`✅ ${imoveisExemplo.length} imóveis de exemplo criados com sucesso!`);
    console.log("---");
    console.log("Estrutura CORRETA criada:");
    console.log("- Grupos PARES (12, 14, 16, 18): 6 torres (blocos A-F)");
    console.log("- Grupos ÍMPARES (13, 15, 17): 7 torres (blocos A-G)");
    console.log("- Grupos 12, 14, 16, 18: Apartamentos de 2 dormitórios");
    console.log("- Grupos 13, 15, 17: Apartamentos de 3 dormitórios");
    console.log("- Status: Disponível para Venda e Disponível para Locação");
    console.log("---");

  } catch (error) {
    console.error("❌ Erro ao criar imóveis de exemplo:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Conexão com MongoDB fechada.");
  }
};

seedImoveis();