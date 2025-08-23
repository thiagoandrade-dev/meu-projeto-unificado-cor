const mongoose = require('mongoose');
const FileSync = require('../utils/fileSync');
require('dotenv').config();

/**
 * Script para testar a funcionalidade de sincronização de arquivos
 */
async function testFileSync() {
  try {
    console.log('🚀 Iniciando teste de sincronização de arquivos...');
    
    // Conectar ao banco de dados
    const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');
    
    const fileSync = new FileSync();
    
    console.log('\n📊 Gerando relatório de integridade...');
    const report = await fileSync.generateIntegrityReport();
    console.log('Relatório de Integridade:', JSON.stringify(report, null, 2));
    
    console.log('\n🔍 Verificando imagens órfãs...');
    const orphanCheck = await fileSync.checkOrphanedImovelImages();
    console.log('Verificação de Órfãs:', {
      imagensOrfas: orphanCheck.imagensOrfas.length,
      referenciasBroken: orphanCheck.referenciasBroken.length,
      totalImagensNoBanco: orphanCheck.totalImagensNoBanco,
      totalArquivosFisicos: orphanCheck.totalArquivosFisicos
    });
    
    if (orphanCheck.imagensOrfas.length > 0) {
      console.log('\n📋 Imagens órfãs encontradas:');
      orphanCheck.imagensOrfas.forEach((imagem, index) => {
        console.log(`  ${index + 1}. ${imagem}`);
      });
    }
    
    if (orphanCheck.referenciasBroken.length > 0) {
      console.log('\n🔗 Referências quebradas encontradas:');
      orphanCheck.referenciasBroken.forEach((ref, index) => {
        console.log(`  ${index + 1}. ${ref}`);
      });
    }
    
    // Perguntar se deve executar correções
    if (orphanCheck.referenciasBroken.length > 0 || orphanCheck.imagensOrfas.length > 0) {
      console.log('\n⚠️  Problemas encontrados!');
      console.log('Para executar correções automáticas, use:');
      console.log('- Corrigir referências: node scripts/fix-references.js');
      console.log('- Limpar órfãs: node scripts/clean-orphans.js');
      console.log('- Sincronização completa: node scripts/sync-complete.js');
    } else {
      console.log('\n✅ Nenhum problema encontrado! Sistema está sincronizado.');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testFileSync();
}

module.exports = testFileSync;