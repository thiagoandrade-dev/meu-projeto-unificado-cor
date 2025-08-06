require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

// Configure seus dados de administrador aqui
const adminData = {
  nome: "Administrador Firenze",
  email: "admin@imobiliariafirenze.com.br",
  senha: "admin123",
  perfil: "admin"
};

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function criarNovoAdmin() {
  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB para criar novo admin...");

    // Verificar se já existe um usuário com este email
    const existingUser = await Inquilino.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log(`Já existe um usuário com o email ${adminData.email}.`);
      console.log(`Usuário existente: ${existingUser.nome} (${existingUser.perfil})`);
      
      if (existingUser.perfil !== "admin") {
        existingUser.perfil = "admin";
        await existingUser.save();
        console.log(`Perfil do usuário ${adminData.email} atualizado para admin.`);
      } else {
        console.log(`Usuário ${adminData.email} já é admin.`);
      }
    } else {
      console.log(`Criando novo usuário administrador: ${adminData.email}`);
      // A senha será criptografada pelo hook pre-save no modelo InquilinoSchema
      const adminUser = new Inquilino(adminData);
      await adminUser.save();
      console.log(`Usuário administrador ${adminUser.nome} (${adminUser.email}) com perfil '${adminUser.perfil}' criado com sucesso!`);
    }

  } catch (error) {
    console.error("Erro ao criar novo usuário administrador:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("Desconectado do MongoDB.");
    }
  }
}

criarNovoAdmin();