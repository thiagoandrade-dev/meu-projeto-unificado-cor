require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

const emailsParaVerificar = [
  "admin@imobiliariafirenze.com.br",
  "thiago@email.com"
];

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function verificarUsuarios() {
  try {
    await mongoose.connect(dbURI);
    console.log(`Conectado ao MongoDB para verificar usuários...`);

    for (const email of emailsParaVerificar) {
      // Buscar usuário com o email específico e incluir o campo senha
      const usuario = await Inquilino.findOne({ email }).select("+senha");

      if (!usuario) {
        console.log(`Nenhum usuário encontrado com o email: ${email}`);
        continue;
      }

      console.log(`\nUsuário encontrado com o email: ${email}`);
      console.log(`Nome: ${usuario.nome}`);
      console.log(`Email: ${usuario.email}`);
      console.log(`Perfil: ${usuario.perfil}`);
      // Não vamos mostrar a senha, mas podemos verificar se ela existe
      console.log(`Tem senha definida: ${usuario.senha ? 'Sim' : 'Não'}`);
    }

  } catch (error) {
    console.error("Erro ao verificar usuários:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("\nDesconectado do MongoDB.");
    }
  }
}

verificarUsuarios();