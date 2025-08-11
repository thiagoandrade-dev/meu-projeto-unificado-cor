// backend/teste-notificacoes-automaticas.js
require('dotenv').config();
const notificacaoService = require('./services/notificacaoAutomaticaService');

async function testarNotificacoesAutomaticas() {
  console.log('🚀 Iniciando teste do sistema de notificações automáticas...\n');

  try {
    // 🎂 Teste 1: Parabéns de aniversário
    console.log('🎂 Teste 1: Enviando parabéns de aniversário...');
    const inquilinoTeste = {
      _id: 'teste-aniversario',
      nome: 'Maria Silva',
      email: 'imobfirenze@gmail.com', // Usando o e-mail de teste
      idade: 35
    };
    await notificacaoService.enviarParabensAniversario(inquilinoTeste);
    console.log('✅ Parabéns enviado com sucesso!\n');

    // Aguardar 2 segundos entre os testes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 👋 Teste 2: Boas-vindas
    console.log('👋 Teste 2: Enviando boas-vindas...');
    const usuarioTeste = {
      _id: 'teste-boas-vindas',
      nome: 'João Santos',
      email: 'imobfirenze@gmail.com'
    };
    await notificacaoService.enviarBoasVindas(usuarioTeste, 'inquilino');
    console.log('✅ Boas-vindas enviado com sucesso!\n');

    // Aguardar 2 segundos entre os testes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 💰 Teste 3: Lembrete de vencimento de aluguel
    console.log('💰 Teste 3: Enviando lembrete de vencimento...');
    const contratoTeste = {
      _id: 'teste-vencimento',
      valorAluguel: 1500.00,
      dataVencimento: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 dias a partir de hoje
      inquilino: {
        nome: 'Ana Costa',
        email: 'imobfirenze@gmail.com'
      }
    };
    await notificacaoService.enviarLembreteVencimentoAluguel(contratoTeste, 7);
    console.log('✅ Lembrete de vencimento enviado com sucesso!\n');

    // Aguardar 2 segundos entre os testes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 📈 Teste 4: Reajuste anual
    console.log('📈 Teste 4: Enviando notificação de reajuste...');
    const contratoReajuste = {
      _id: 'teste-reajuste',
      valorAluguel: 2000.00,
      inquilino: {
        nome: 'Carlos Oliveira',
        email: 'imobfirenze@gmail.com'
      }
    };
    const dataVigencia = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 dias a partir de hoje
    await notificacaoService.enviarNotificacaoReajuste(contratoReajuste, 5.5, dataVigencia);
    console.log('✅ Notificação de reajuste enviada com sucesso!\n');

    // Aguardar 2 segundos entre os testes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 🏠 Teste 5: Vencimento de contrato
    console.log('🏠 Teste 5: Enviando lembrete de vencimento de contrato...');
    const contratoVencimento = {
      _id: 'teste-contrato-vencimento',
      dataFim: new Date(Date.now() + (45 * 24 * 60 * 60 * 1000)), // 45 dias a partir de hoje
      inquilino: {
        nome: 'Fernanda Lima',
        email: 'imobfirenze@gmail.com'
      },
      imovel: {
        endereco: 'Rua das Flores, 123 - Centro, São Paulo/SP'
      }
    };
    await notificacaoService.enviarLembreteVencimentoContrato(contratoVencimento, 60);
    console.log('✅ Lembrete de vencimento de contrato enviado com sucesso!\n');

    console.log('🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('📧 Verifique o e-mail imobfirenze@gmail.com para ver todos os templates');
    console.log('\n📋 Resumo dos testes realizados:');
    console.log('   🎂 Parabéns de aniversário para Maria Silva');
    console.log('   👋 Boas-vindas para João Santos');
    console.log('   💰 Lembrete de vencimento para Ana Costa');
    console.log('   📈 Reajuste anual para Carlos Oliveira');
    console.log('   🏠 Vencimento de contrato para Fernanda Lima');
    console.log('\n✨ Sistema de notificações automáticas 100% funcional!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar os testes
testarNotificacoesAutomaticas()
  .then(() => {
    console.log('\n🏁 Teste finalizado. Pressione Ctrl+C para sair.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });