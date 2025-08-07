require('dotenv').config();
const mongoose = require('mongoose');
const Contrato = require('./models/Contrato');
const Inquilino = require('./models/Inquilino');
const Imovel = require('./models/Imovel');

async function createTestContracts() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Verificar se já existem contratos
    const count = await Contrato.countDocuments();
    console.log(`Contratos existentes: ${count}`);

    if (count === 0) {
      // Buscar inquilinos e imóveis
      const inquilinos = await Inquilino.find().limit(5);
      const imoveis = await Imovel.find().limit(5);
      
      console.log(`Inquilinos encontrados: ${inquilinos.length}`);
      console.log(`Imóveis encontrados: ${imoveis.length}`);

      if (inquilinos.length === 0 || imoveis.length === 0) {
        console.log('Não há inquilinos ou imóveis suficientes');
        return;
      }

      // Criar contratos de teste
      const contratos = [
        {
          codigo: "CTR2023001",
          tipo: "Locação",
          status: "Ativo",
          dataInicio: new Date("2023-01-15"),
          dataFim: new Date("2024-01-14"),
          duracaoMeses: 12,
          valorAluguel: 1800.00,
          observacoes: "Contrato padrão de locação",
          inquilinoId: inquilinos[0]._id,
          imovelId: imoveis[0]._id
        },
        {
          codigo: "CTR2023002",
          tipo: "Locação",
          status: "Ativo",
          dataInicio: new Date("2023-02-01"),
          dataFim: new Date("2024-01-31"),
          duracaoMeses: 12,
          valorAluguel: 2200.00,
          observacoes: "Inclui taxa de condomínio",
          inquilinoId: inquilinos[1 % inquilinos.length]._id,
          imovelId: imoveis[1 % imoveis.length]._id
        },
        {
          codigo: "CTR2023003",
          tipo: "Locação",
          status: "Ativo",
          dataInicio: new Date("2023-03-10"),
          dataFim: new Date("2024-03-09"),
          duracaoMeses: 12,
          valorAluguel: 1950.00,
          observacoes: "Contrato renovado",
          inquilinoId: inquilinos[2 % inquilinos.length]._id,
          imovelId: imoveis[2 % imoveis.length]._id
        }
      ];

      await Contrato.insertMany(contratos);
      console.log('Contratos criados com sucesso!');
    } else {
      console.log('Contratos já existem');
    }

    // Verificar novamente
    const newCount = await Contrato.countDocuments();
    console.log(`Total de contratos após operação: ${newCount}`);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestContracts();