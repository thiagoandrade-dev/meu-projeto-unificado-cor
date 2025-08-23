const mongoose = require('mongoose');
const FileSync = require('../utils/fileSync');
require('dotenv').config();

/**
 * Script para executar sincronização completa
 * Corrige referências quebradas e remove imagens órfãs
 */
async function syncComplete() {
  try {
    console.log('🚀 Iniciando sincronização completa...');
    
    // Conectar ao banco de dados
    const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB!');
    
    const fileSync = new FileSync();
    
    console.log('\n📊 Estado inicial...');
    const initialReport = await fileSync.generateIntegrityReport();
    console.log('Integridade inicial:', {
      imagensOrfas: initialReport.imoveis.imagensOrfas,
      referenciasBroken: initialReport.imoveis.referenciasBroken,
      percentualIntegridade: initialReport.imoveis.integridade.percentual + '%',
      status: initialReport.imoveis.integridade.status
    });
    
    if (initialReport.imoveis.integridade.status === 'OK') {
      console.log('\n✅ Sistema já está sincronizado!');
      return;
    }
    
    console.log('\n🔧 Executando sincronização completa...');
    const result = await fileSync.syncComplete();
    
    console.log('\n📋 Resultados da sincronização:');
    console.log('\n🔧 Correções de referências:');
    console.log(`  - Imóveis corrigidos: ${result.correcoes.imoveisCorrigidos}`);
    console.log(`  - Referências quebradas removidas: ${result.correcoes.imagensRemovidas}`);
    
    console.log('\n🧹 Limpeza de órfãs:');
    console.log(`  - Imagens órfãs removidas: ${result.limpeza.removidas}`);
    console.log(`  - Total de órfãs encontradas: ${result.limpeza.total}`);
    
    console.log('\n📊 Estado final:');
    console.log('Integridade final:', {
      imagensOrfas: result.final.imagensOrfas,
      referenciasBroken: result.final.referenciasBroken,
      percentualIntegridade: result.final.integridade?.percentual + '%' || 'N/A',
      status: result.final.integridade?.status || 'N/A'
    });
    
    if (result.final.imagensOrfas === 0 && result.final.referenciasBroken === 0) {
      console.log('\n🎉 Sincronização completa! Sistema totalmente sincronizado.');
    } else {
      console.log('\n⚠️  Ainda existem problemas. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  syncComplete();
}

module.exports = syncComplete;