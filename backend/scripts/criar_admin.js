require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }); // Caminho do .env ajustado para ser mais robusto
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

// Configure seus dados de administrador aqui
const adminData = {
  nome: "Administrador Firenze",
  email: "admin@firenze.com",
  senha: "admin123",
  perfil: "admin" // <<< IMPORTANTE: Adicionado o campo perfil aqui
};

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env. Verifique o caminho no script criar_admin.js se necessário.");
  process.exit(1);
}

async function criarOuAtualizarAdmin() {
  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB para criar/atualizar admin...");

    let adminUser = await Inquilino.findOne({ email: adminData.email });

    if (adminUser) {
      console.log(`Usuário com email ${adminData.email} já existe.`);
      if (adminUser.perfil !== "admin") {
        adminUser.perfil = "admin";
        // Se precisar resetar a senha ao atualizar o perfil:
        // adminUser.senha = adminData.senha; // A senha será hasheada pelo pre-save hook
        await adminUser.save();
        console.log(`Perfil do usuário ${adminData.email} atualizado para admin.`);
      } else {
        console.log(`Usuário ${adminData.email} já é admin.`);
      }
    } else {
      console.log(`Criando novo usuário administrador: ${adminData.email}`);
      // A senha será criptografada pelo hook pre-save no modelo InquilinoSchema
      adminUser = new Inquilino(adminData);
      await adminUser.save();
      console.log(`Usuário administrador ${adminUser.nome} (${adminUser.email}) com perfil '${adminUser.perfil}' criado com sucesso!`);
    }

  } catch (error) {
    console.error("Erro ao criar/atualizar usuário administrador:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log("Desconectado do MongoDB.");
    }
  }
}

criarOuAtualizarAdmin();
