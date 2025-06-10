// Local: backend/seed.js (VERSÃO FINAL CORRIGIDA)

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ✅ CORREÇÃO: Usando o nome do modelo correto que você descobriu!
const Inquilino = require("./models/Inquilino");

const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";

const seedUsers = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Conectado ao MongoDB para seeding...");

    // ✅ CORREÇÃO: Usando o modelo correto.
    await Inquilino.deleteMany({ email: { $in: ["admin@firenze.com", "inquilino@teste.com"] } });
    console.log("Usuários de teste antigos removidos.");

    const senhaCriptografada = await bcrypt.hash("123456", 10);

    const usuariosParaCriar = [
      {
        nome: "Admin Firenze",
        email: "admin@firenze.com",
        senha: senhaCriptografada,
        perfil: "admin", // Importante para diferenciar o usuário
        status: "Ativo"
      },
      {
        nome: "Thiago Inquilino",
        email: "inquilino@teste.com",
        senha: senhaCriptografada,
        perfil: "inquilino", // Importante para diferenciar o usuário
        status: "Ativo"
      }
    ];

    // ✅ CORREÇÃO: Usando o modelo correto.
    await Inquilino.insertMany(usuariosParaCriar);
    console.log("✅ Usuários de teste criados com sucesso!");
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