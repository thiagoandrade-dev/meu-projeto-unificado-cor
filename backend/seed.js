// Local: backend/seed.js (VERSÃO FINAL E CORRETA)

require("dotenv").config();
const mongoose = require("mongoose");
// O bcrypt aqui não é mais necessário, pois o modelo fará o hash
// const bcrypt = require("bcryptjs"); 

const Inquilino = require("./models/Inquilino");

const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";

const seedUsers = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Conectado ao MongoDB para seeding...");

    await Inquilino.deleteMany({ email: { $in: ["admin@firenze.com", "inquilino@teste.com"] } });
    console.log("Usuários de teste antigos removidos.");

    // ✅ CORREÇÃO: Removida a criptografia daqui. A senha é enviada em texto plano.
    // O modelo Inquilino.js irá criptografá-la automaticamente antes de salvar.
    const usuariosParaCriar = [
      {
        nome: "Admin Firenze",
        email: "admin@firenze.com",
        senha: "123456", // Enviando a senha original
        perfil: "admin",
        status: "ativo"
      },
      {
        nome: "Thiago Inquilino",
        email: "inquilino@teste.com",
        senha: "123456", // Enviando a senha original
        perfil: "inquilino",
        status: "ativo"
      }
    ];

    // Usar create() em vez de insertMany() para acionar o middleware pre-save
    for (const userData of usuariosParaCriar) {
      await Inquilino.create(userData);
      console.log(`Usuário criado: ${userData.email}`);
    }
    console.log("✅ Usuários de teste criados com sucesso (com senhas corretamente hasheadas pelo modelo)!");
    console.log("---");
    console.log("Admin: admin@firenze.com | Senha: 123456");
    console.log("Inquilino: inquilino@teste.com | Senha: 123456");
    console.log("---");

  } catch (error) {
    console.error("❌ Erro ao criar usuários de teste:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Conexão com MongoDB fechada.");
  }
};

seedUsers();