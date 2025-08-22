// Script para adicionar mais imóveis de exemplo para testes
require("dotenv").config();
const mongoose = require("mongoose");
const Imovel = require("../models/Imovel");

const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";

const adicionarMaisImoveis = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Conectado ao MongoDB para adicionar mais imóveis...");

    // Novos imóveis para teste - seguindo o padrão do modelo
    const novosImoveis = [
      // GRUPO 15 (ÍMPAR) - Blocos A-G - Mais opções
      {
        grupo: 15,
        bloco: "A",
        andar: 3,
        apartamento: 31,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Descoberta",
        preco: 295000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 15,
        bloco: "B",
        andar: 6,
        apartamento: 62,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 1800,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 15,
        bloco: "C",
        andar: 11,
        apartamento: 111,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 335000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 15,
        bloco: "D",
        andar: 14,
        apartamento: 141,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 2800,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 15,
        bloco: "E",
        andar: 17,
        apartamento: 171,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 495000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 15,
        bloco: "F",
        andar: 19,
        apartamento: 191,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 3200,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 15,
        bloco: "G",
        andar: 23,
        apartamento: 231,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 525000,
        statusAnuncio: "Disponível para Venda"
      },

      // GRUPO 16 (PAR) - Blocos A-F - Mais variedade
      {
        grupo: 16,
        bloco: "A",
        andar: 4,
        apartamento: 41,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Descoberta",
        preco: 1650,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 16,
        bloco: "B",
        andar: 8,
        apartamento: 81,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 328000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 16,
        bloco: "C",
        andar: 13,
        apartamento: 131,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 1950,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 16,
        bloco: "D",
        andar: 16,
        apartamento: 161,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 465000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 16,
        bloco: "E",
        andar: 21,
        apartamento: 211,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 3100,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 16,
        bloco: "F",
        andar: 24,
        apartamento: 241,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 510000,
        statusAnuncio: "Disponível para Venda"
      },

      // GRUPO 17 (ÍMPAR) - Blocos A-G - Apartamentos premium
      {
        grupo: 17,
        bloco: "A",
        andar: 2,
        apartamento: 21,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Descoberta",
        preco: 285000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 17,
        bloco: "B",
        andar: 7,
        apartamento: 72,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 1750,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 17,
        bloco: "C",
        andar: 12,
        apartamento: 122,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 342000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 17,
        bloco: "D",
        andar: 15,
        apartamento: 152,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 2750,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 17,
        bloco: "E",
        andar: 27,
        apartamento: 271,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 545000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 17,
        bloco: "F",
        andar: 29,
        apartamento: 291,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 2,
        tipoVagaGaragem: "Coberta",
        preco: 3350,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 17,
        bloco: "G",
        andar: 32,
        apartamento: 321,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 565000,
        statusAnuncio: "Disponível para Venda"
      },

      // GRUPO 18 (PAR) - Blocos A-F - Cobertura e apartamentos especiais
      {
        grupo: 18,
        bloco: "A",
        andar: 1,
        apartamento: 11,
        configuracaoPlanta: "Padrão (2 dorms)",
        areaUtil: 82,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Descoberta",
        preco: 275000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 18,
        bloco: "B",
        andar: 5,
        apartamento: 52,
        configuracaoPlanta: "2 dorms + Despensa",
        areaUtil: 84,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 1680,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 18,
        bloco: "C",
        andar: 9,
        apartamento: 91,
        configuracaoPlanta: "2 dorms + Dependência",
        areaUtil: 86,
        numVagasGaragem: 1,
        tipoVagaGaragem: "Coberta",
        preco: 332000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 18,
        bloco: "D",
        andar: 33,
        apartamento: 331,
        configuracaoPlanta: "Padrão (3 dorms)",
        areaUtil: 125,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 3500,
        statusAnuncio: "Disponível para Locação"
      },
      {
        grupo: 18,
        bloco: "E",
        andar: 35,
        apartamento: 351,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 580000,
        statusAnuncio: "Disponível para Venda"
      },
      {
        grupo: 18,
        bloco: "F",
        andar: 36,
        apartamento: 361,
        configuracaoPlanta: "3 dorms + Dependência",
        areaUtil: 135,
        numVagasGaragem: 3,
        tipoVagaGaragem: "Coberta",
        preco: 3800,
        statusAnuncio: "Disponível para Locação"
      }
    ];

    // Inserir os novos imóveis
    const imoveisCriados = await Imovel.insertMany(novosImoveis);
    console.log(`✅ ${imoveisCriados.length} novos imóveis adicionados com sucesso!`);
    
    // Mostrar resumo
    const totalImoveis = await Imovel.countDocuments();
    console.log(`📊 Total de imóveis no banco: ${totalImoveis}`);
    
    // Mostrar alguns exemplos dos novos imóveis criados
    console.log("\n🏠 Exemplos dos novos imóveis adicionados:");
    imoveisCriados.slice(0, 5).forEach((imovel, index) => {
      console.log(`${index + 1}. Grupo ${imovel.grupo}, Bloco ${imovel.bloco}, Andar ${imovel.andar}, Apt ${imovel.apartamento} - ${imovel.configuracaoPlanta} - R$ ${imovel.preco.toLocaleString('pt-BR')}`);
    });
    
    if (imoveisCriados.length > 5) {
      console.log(`... e mais ${imoveisCriados.length - 5} imóveis.`);
    }

  } catch (error) {
    console.error("❌ Erro ao adicionar imóveis:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Desconectado do MongoDB.");
  }
};

adicionarMaisImoveis();