// Script para atualizar o último acesso de usuários que já existem
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/imobiliaria", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado ao MongoDB");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

// Atualizar último acesso dos usuários admin
const atualizarUltimoAcesso = async () => {
  try {
    console.log("🔄 Iniciando atualização do último acesso...");
    
    // Buscar todos os usuários
    const usuarios = await Inquilino.find();
    console.log(`📊 Encontrados ${usuarios.length} usuários`);
    
    // Atualizar usuários admin com último acesso simulado
    const usuariosAdmin = usuarios.filter(u => u.perfil === 'admin');
    
    for (const admin of usuariosAdmin) {
      // Simular último acesso há algumas horas
      const ultimoAcesso = new Date();
      ultimoAcesso.setHours(ultimoAcesso.getHours() - Math.floor(Math.random() * 24)); // Entre 0-24 horas atrás
      
      await Inquilino.findByIdAndUpdate(admin._id, {
        ultimoAcesso: ultimoAcesso
      });
      
      console.log(`✅ Atualizado último acesso para ${admin.nome} (${admin.email}): ${ultimoAcesso.toLocaleString('pt-BR')}`);
    }
    
    // Verificar resultado
    const usuariosAtualizados = await Inquilino.find({ ultimoAcesso: { $exists: true } });
    console.log(`\n📈 Resultado:`);
    console.log(`   - Total de usuários: ${usuarios.length}`);
    console.log(`   - Com último acesso: ${usuariosAtualizados.length}`);
    console.log(`   - Sem último acesso: ${usuarios.length - usuariosAtualizados.length}`);
    
    console.log("\n🎯 Atualização concluída!");
    
  } catch (error) {
    console.error("❌ Erro ao atualizar último acesso:", error);
  }
};

// Executar script
const executar = async () => {
  await connectDB();
  await atualizarUltimoAcesso();
  await mongoose.disconnect();
  console.log("🔌 Desconectado do MongoDB");
  process.exit(0);
};

executar();