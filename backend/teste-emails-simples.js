// backend/teste-emails-simples.js
require('dotenv').config();
const { sendEmail } = require('./config/emailConfig');

// Templates de e-mail simplificados para teste
const emailTemplates = {
  // 🎂 Aniversário
  aniversario: (nome, idade) => ({
    subject: `🎂 Parabéns pelo seu aniversário, ${nome}! - Imobiliária Firenze`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="font-size: 2.5em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎉 PARABÉNS! 🎉</h1>
          <h2 style="margin: 20px 0; font-size: 1.8em;">Feliz Aniversário, ${nome}!</h2>
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 30px 0;">
            <p style="font-size: 1.2em; margin: 0;">🎂 ${idade ? `${idade} anos` : 'Mais um ano'} de vida!</p>
            <p style="font-size: 1.1em; margin: 10px 0;">Que este novo ano seja repleto de alegrias, conquistas e realizações!</p>
          </div>
          <p style="font-size: 1em; margin: 20px 0;">A equipe da Imobiliária Firenze deseja um dia muito especial para você!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
            <p style="font-size: 0.9em; margin: 0;">Com carinho,</p>
            <p style="font-size: 1.1em; font-weight: bold; margin: 5px 0;">Equipe Imobiliária Firenze</p>
          </div>
        </div>
      </div>
    `
  }),

  // 👋 Boas-vindas
  boasVindas: (nome, tipoUsuario) => ({
    subject: `👋 Bem-vindo(a) à Imobiliária Firenze, ${nome}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 2.2em;">👋 Bem-vindo(a)!</h1>
          <h2 style="margin: 20px 0; font-weight: normal;">Olá, ${nome}!</h2>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 1.1em; color: #333; margin-bottom: 20px;">
            É um prazer tê-lo(a) conosco na <strong>Imobiliária Firenze</strong>!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #333; margin-top: 0;">🏠 O que você pode fazer:</h3>
            <ul style="color: #666; line-height: 1.6;">
              ${tipoUsuario === 'inquilino' ? `
                <li>📋 Acompanhar seus contratos</li>
                <li>💰 Visualizar boletos e pagamentos</li>
                <li>📞 Entrar em contato conosco</li>
                <li>📄 Acessar documentos importantes</li>
              ` : `
                <li>🏢 Gerenciar imóveis</li>
                <li>👥 Administrar inquilinos</li>
                <li>📊 Acompanhar relatórios</li>
                <li>⚙️ Configurar o sistema</li>
              `}
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🚀 Acessar Sistema
            </a>
          </div>
          <p style="color: #666; font-size: 0.9em; text-align: center; margin-top: 30px;">
            Se precisar de ajuda, estamos sempre à disposição!
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 0.9em; text-align: center; margin: 0;">
            Imobiliária Firenze - Seu lar, nossa prioridade
          </p>
        </div>
      </div>
    `
  }),

  // 💰 Lembrete de vencimento de aluguel
  vencimentoAluguel: (nome, valor, dataVencimento, diasRestantes) => ({
    subject: `💰 Lembrete: Aluguel vence ${diasRestantes <= 0 ? 'hoje' : `em ${diasRestantes} dia(s)`} - Imobiliária Firenze`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${diasRestantes <= 0 ? '#f44336' : diasRestantes <= 3 ? '#ff9800' : '#2196F3'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 2em;">💰 Lembrete de Pagamento</h1>
          <h2 style="margin: 15px 0; font-weight: normal;">Olá, ${nome}!</h2>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${diasRestantes <= 0 ? '#f44336' : diasRestantes <= 3 ? '#ff9800' : '#2196F3'};">
            <h3 style="color: #333; margin-top: 0;">
              ${diasRestantes <= 0 ? '🚨 Vencimento HOJE!' : diasRestantes <= 3 ? '⚠️ Vencimento Próximo!' : '📅 Lembrete de Vencimento'}
            </h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>💵 Valor:</strong> R$ ${valor}</p>
              <p style="margin: 5px 0; color: #333;"><strong>📅 Vencimento:</strong> ${dataVencimento}</p>
              <p style="margin: 5px 0; color: #333;"><strong>⏰ Status:</strong> 
                <span style="color: ${diasRestantes <= 0 ? '#f44336' : diasRestantes <= 3 ? '#ff9800' : '#2196F3'}; font-weight: bold;">
                  ${diasRestantes <= 0 ? 'Vence hoje!' : diasRestantes === 1 ? 'Vence amanhã!' : `Vence em ${diasRestantes} dias`}
                </span>
              </p>
            </div>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:3000/boletos" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              💳 Ver Boleto
            </a>
          </div>
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2; font-size: 0.9em;">
              💡 <strong>Dica:</strong> Evite juros e multas pagando até a data de vencimento!
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 0.9em; text-align: center; margin: 0;">
            Imobiliária Firenze - Facilitando sua vida
          </p>
        </div>
      </div>
    `
  })
};

async function testarEmailsSimples() {
  console.log('🚀 Iniciando teste simplificado de e-mails...\n');

  try {
    // 🎂 Teste 1: Parabéns de aniversário
    console.log('🎂 Teste 1: Enviando parabéns de aniversário...');
    const templateAniversario = emailTemplates.aniversario('Maria Silva', 35);
    await sendEmail({
      to: 'imobfirenze@gmail.com',
      subject: templateAniversario.subject,
      html: templateAniversario.html
    });
    console.log('✅ Parabéns enviado com sucesso!\n');

    // Aguardar 2 segundos entre os testes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 👋 Teste 2: Boas-vindas
    console.log('👋 Teste 2: Enviando boas-vindas...');
    const templateBoasVindas = emailTemplates.boasVindas('João Santos', 'inquilino');
    await sendEmail({
      to: 'imobfirenze@gmail.com',
      subject: templateBoasVindas.subject,
      html: templateBoasVindas.html
    });
    console.log('✅ Boas-vindas enviado com sucesso!\n');

    // Aguardar 2 segundos entre os testes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 💰 Teste 3: Lembrete de vencimento de aluguel
    console.log('💰 Teste 3: Enviando lembrete de vencimento...');
    const templateVencimento = emailTemplates.vencimentoAluguel(
      'Ana Costa', 
      '1.500,00', 
      '15/01/2024', 
      3
    );
    await sendEmail({
      to: 'imobfirenze@gmail.com',
      subject: templateVencimento.subject,
      html: templateVencimento.html
    });
    console.log('✅ Lembrete de vencimento enviado com sucesso!\n');

    console.log('🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('📧 Verifique o e-mail imobfirenze@gmail.com para ver todos os templates');
    console.log('\n📋 Resumo dos testes realizados:');
    console.log('   🎂 Parabéns de aniversário para Maria Silva');
    console.log('   👋 Boas-vindas para João Santos');
    console.log('   💰 Lembrete de vencimento para Ana Costa');
    console.log('\n✨ Sistema de e-mails 100% funcional!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

// Executar os testes
testarEmailsSimples()
  .then(() => {
    console.log('\n🏁 Teste finalizado. Pressione Ctrl+C para sair.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });