require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");
const bcrypt = require("bcryptjs");

const emailParaVerificar = "viviane-medeiros@outlook.com.br";

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error("Erro: MONGODB_URI não está definido no arquivo .env.");
  process.exit(1);
}

async function verificarViviane() {
  try {
    await mongoose.connect(dbURI);
    console.log(`Conectado ao MongoDB para verificar usuário...`);

    // Buscar usuário com o email específico e incluir o campo senha
    const usuario = await Inquilino.findOne({ email: emailParaVerificar }).select("+senha");

    if (!usuario) {
      console.log(`❌ Nenhum usuário encontrado com o email: ${emailParaVerificar}`);
      return;
    }

    console.log(`✅ Usuário encontrado com o email: ${emailParaVerificar}`);
    console.log(`Nome: ${usuario.nome}`);
    console.log(`Email: ${usuario.email}`);
    console.log(`Perfil: ${usuario.perfil}`);
    console.log(`Status: ${usuario.status}`);
    console.log(`Data de Cadastro: ${usuario.dataCadastro || usuario.createdAt}`);
    console.log(`Último Acesso: ${usuario.ultimoAcesso || 'Nunca'}`);
    
    if (usuario.senha) {
      console.log(`\n🔐 Informações da Senha:`);
      console.log(`Senha está definida: Sim`);
      console.log(`Hash da senha: ${usuario.senha}`);
      
      // Tentar algumas senhas comuns para verificar
      const senhasComuns = ['123456', 'admin123', 'viviane123', 'senha123', 'password'];
      
      console.log(`\n🔍 Testando senhas comuns...`);
      for (const senhaTest of senhasComuns) {
        const senhaCorreta = await bcrypt.compare(senhaTest, usuario.senha);
        if (senhaCorreta) {
          console.log(`✅ SENHA ENCONTRADA: "${senhaTest}"`);
          break;
        }
      }
    } else {
      console.log(`❌ Senha não está definida`);
    }

  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("\nDesconectado do MongoDB.");
    }
  }
}

verificarViviane();