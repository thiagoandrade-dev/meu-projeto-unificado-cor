// Teste de configuração de e-mail
require('dotenv').config();
const { verifyEmailConfig, sendEmail } = require('./config/emailConfig');

async function testarEmail() {
  console.log('🧪 Testando configuração de e-mail...\n');
  
  // Verificar configuração
  console.log('📋 Configurações atuais:');
  console.log(`Host: ${process.env.EMAIL_HOST}`);
  console.log(`Port: ${process.env.EMAIL_PORT}`);
  console.log(`User: ${process.env.EMAIL_USER}`);
  console.log(`From Name: ${process.env.EMAIL_FROM_NAME}`);
  console.log(`From Email: ${process.env.EMAIL_FROM_EMAIL}\n`);
  
  // Verificar conexão
  console.log('🔍 Verificando conexão SMTP...');
  const isValid = await verifyEmailConfig();
  
  if (isValid) {
    console.log('✅ Conexão SMTP válida!\n');
    
    // Testar envio (para o próprio e-mail)
    console.log('📧 Testando envio de e-mail...');
    try {
      await sendEmail({
        to: process.env.EMAIL_USER, // Envia para o próprio e-mail
        subject: 'Teste - Sistema Imobiliária Firenze',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎉 Configuração de E-mail Funcionando!</h2>
            <p>Parabéns! O sistema de e-mail da Imobiliária Firenze está configurado corretamente.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <strong>✅ Funcionalidades ativas:</strong><br>
              • Recuperação de senha<br>
              • Notificações automáticas<br>
              • Relatórios por e-mail<br>
              • Contatos do site
            </div>
            <p>Teste realizado em: ${new Date().toLocaleString('pt-BR')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Imobiliária Firenze - Sistema de Gestão</p>
          </div>
        `
      });
      console.log('✅ E-mail de teste enviado com sucesso!');
      console.log('📬 Verifique sua caixa de entrada em: ' + process.env.EMAIL_USER);
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de teste:', error.message);
    }
  } else {
    console.log('❌ Erro na configuração SMTP');
  }
  
  console.log('\n🏁 Teste concluído!');
  process.exit(0);
}

testarEmail();