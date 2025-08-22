require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");
const bcrypt = require("bcryptjs");

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function testarLogin() {
  try {
    await mongoose.connect(dbURI);
    console.log(`Conectado ao MongoDB para testar login...`);

    const email = "inquilino@teste.com";
    const senhaTexto = "123456";

    // Buscar usuário
    const usuario = await Inquilino.findOne({ email }).select("+senha");

    if (!usuario) {
      console.log(`Usuário não encontrado: ${email}`);
      return;
    }

    console.log(`\nUsuário encontrado: ${email}`);
    console.log(`Nome: ${usuario.nome}`);
    console.log(`Perfil: ${usuario.perfil}`);
    console.log(`Status: ${usuario.status}`);
    console.log(`Senha hash: ${usuario.senha}`);

    // Testar comparação de senha
    const senhaCorreta = await bcrypt.compare(senhaTexto, usuario.senha);
    console.log(`\nTeste de senha:`);
    console.log(`Senha fornecida: "${senhaTexto}"`);
    console.log(`Senha correta: ${senhaCorreta}`);

    if (senhaCorreta) {
      console.log(`✅ LOGIN SERIA BEM-SUCEDIDO`);
    } else {
      console.log(`❌ LOGIN FALHARIA - Senha incorreta`);
      
      // Vamos testar se a senha foi hasheada corretamente
      const novoHash = await bcrypt.hash(senhaTexto, 10);
      console.log(`\nNovo hash para "${senhaTexto}": ${novoHash}`);
      
      const testeNovoHash = await bcrypt.compare(senhaTexto, novoHash);
      console.log(`Teste com novo hash: ${testeNovoHash}`);
    }

  } catch (error) {
    console.error("Erro ao testar login:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("\nDesconectado do MongoDB.");
    }
  }
}

testarLogin();