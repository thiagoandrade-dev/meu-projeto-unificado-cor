require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");
const bcrypt = require("bcryptjs");

const dbURI = process.env.MONGODB_URI;

async function testarSenha() {
  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB para testar senha...");

    const usuario = await Inquilino.findOne({ email: "thiago@email.com" }).select("+senha");
    
    if (!usuario) {
      console.log("Usuário não encontrado!");
      return;
    }

    console.log("Usuário encontrado:", usuario.nome);
    console.log("Email:", usuario.email);
    console.log("Perfil:", usuario.perfil);
    console.log("Hash da senha no banco:", usuario.senha);
    
    // Testar a comparação da senha
    const senhaTexto = "admin123";
    const senhaCorreta = await bcrypt.compare(senhaTexto, usuario.senha);
    
    console.log("Senha testada:", senhaTexto);
    console.log("Resultado da comparação:", senhaCorreta);
    
    // Testar criando um novo hash
    const novoHash = await bcrypt.hash(senhaTexto, 10);
    console.log("Novo hash gerado:", novoHash);
    
    const testeNovoHash = await bcrypt.compare(senhaTexto, novoHash);
    console.log("Teste com novo hash:", testeNovoHash);

  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado do MongoDB.");
  }
}

testarSenha();