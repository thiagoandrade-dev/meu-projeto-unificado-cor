require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

// Configuração do novo email para o administrador
const novoEmail = "admin@imobiliariafirenze.com.br";
const emailAtual = "admin@firenze.com";

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function atualizarEmailAdmin() {
  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB para atualizar admin...");

    // Verificar se o usuário com o email atual existe
    const adminUser = await Inquilino.findOne({ email: emailAtual });

    if (!adminUser) {
      console.log(`Usuário com email ${emailAtual} não encontrado.`);
      process.exit(1);
    }

    // Verificar se já existe um usuário com o novo email
    const existingUser = await Inquilino.findOne({ email: novoEmail });
    if (existingUser) {
      console.log(`Já existe um usuário com o email ${novoEmail}.`);
      console.log(`Usuário existente: ${existingUser.nome} (${existingUser.perfil})`);
      process.exit(1);
    }

    // Atualizar o email do administrador
    adminUser.email = novoEmail;
    await adminUser.save();

    console.log(`Email do administrador atualizado de ${emailAtual} para ${novoEmail}.`);

  } catch (error) {
    console.error("Erro ao atualizar email do administrador:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("Desconectado do MongoDB.");
    }
  }
}

atualizarEmailAdmin();