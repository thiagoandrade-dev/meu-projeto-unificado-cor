// backend/config/emailConfig.js
const nodemailer = require('nodemailer');

// Configuração centralizada do transporter de e-mail
const createEmailTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Configurações adicionais para melhor compatibilidade
    tls: {
      rejectUnauthorized: false
    }
  };

  console.log('Configuração de e-mail:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user ? config.auth.user.substring(0, 3) + '***' : 'não configurado'
  });

  return nodemailer.createTransporter(config);
};

// Função para verificar se a configuração de e-mail está válida
const verifyEmailConfig = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('✅ Configuração de e-mail verificada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de e-mail:', error.message);
    return false;
  }
};

// Função para enviar e-mail com template padrão
const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: from || `"${process.env.EMAIL_FROM_NAME || 'Imobiliária Firenze'}" <${process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    console.log('Enviando e-mail para:', to);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ E-mail enviado com sucesso:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error.message);
    throw error;
  }
};

// Templates de e-mail
const emailTemplates = {
  // Template para redefinição de senha
  resetPassword: (resetLink, userName) => ({
    subject: 'Redefinição de Senha - Imobiliária Firenze',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Redefinição de Senha</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Redefinir Senha
        </a>
        <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
        <p>Este link expira em 1 hora.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Imobiliária Firenze - Sistema de Gestão</p>
      </div>
    `
  }),

  // Template para notificações gerais
  notification: (title, message, userName) => ({
    subject: `${title} - Imobiliária Firenze`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          ${message}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">Imobiliária Firenze - Sistema de Gestão</p>
      </div>
    `
  }),

  // Template para relatórios
  report: (reportType, reportData, userName) => ({
    subject: `Relatório ${reportType} - Imobiliária Firenze`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Relatório ${reportType}</h2>
        <p>Olá ${userName || 'usuário'},</p>
        <p>Segue em anexo o relatório solicitado.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <strong>Período:</strong> ${reportData.periodo || 'N/A'}<br>
          <strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">Imobiliária Firenze - Sistema de Gestão</p>
      </div>
    `
  })
};

module.exports = {
  createEmailTransporter,
  verifyEmailConfig,
  sendEmail,
  emailTemplates
};