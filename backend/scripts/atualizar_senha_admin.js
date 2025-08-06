require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");
const bcrypt = require("bcryptjs");

const admins = [
  { email: "admin@imobiliariafirenze.com.br", senha: "admin123" },
  { email: "thiago@email.com", senha: "admin123" }
];

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function atualizarSenhaAdmins() {
  try {
    await mongoose.connect(dbURI);
    console.log(`Conectado ao MongoDB para atualizar senhas dos administradores...`);
    
    for (const admin of admins) {
      // Buscar usuário com o email específico
      const usuario = await Inquilino.findOne({ email: admin.email });

      if (!usuario) {
        console.log(`Nenhum usuário encontrado com o email: ${admin.email}`);
        continue;
      }

      console.log(`Usuário encontrado: ${usuario.nome} (${usuario.perfil})`);
      
      // Atualizar a senha (o middleware pre-save fará o hash automaticamente)
      usuario.senha = admin.senha; // Senha em texto plano - será hasheada pelo middleware
      await usuario.save();
      
      console.log(`Senha atualizada com sucesso para o usuário: ${admin.email}`);
      console.log(`Nova senha definida: ${admin.senha}`);
    }

  } catch (error) {
    console.error("Erro ao atualizar senhas:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("Desconectado do MongoDB.");
    }
  }
}

atualizarSenhaAdmins();