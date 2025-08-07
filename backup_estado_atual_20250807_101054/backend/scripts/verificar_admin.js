require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function verificarAdmin() {
  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB para verificar admin...");

    // Buscar usuário com perfil admin
    const adminUser = await Inquilino.findOne({ perfil: "admin" });

    if (!adminUser) {
      console.log("Nenhum usuário administrador encontrado.");
      process.exit(1);
    }

    console.log("Usuário administrador encontrado:");
    console.log(`Nome: ${adminUser.nome}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Perfil: ${adminUser.perfil}`);

  } catch (error) {
    console.error("Erro ao verificar administrador:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("Desconectado do MongoDB.");
    }
  }
}

verificarAdmin();