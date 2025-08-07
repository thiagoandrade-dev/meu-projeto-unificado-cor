const fs = require('fs');
const path = require('path');
const { verifyEmailConfig, sendEmail } = require('../config/emailConfig');

// Função para ler o arquivo .env
const readEnvFile = () => {
  const envPath = path.join(__dirname, '../.env');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Erro ao ler arquivo .env:', error);
    return {};
  }
};

// Função para escrever no arquivo .env
const writeEnvFile = (envVars) => {
  const envPath = path.join(__dirname, '../.env');
  try {
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao escrever arquivo .env:', error);
    return false;
  }
};

// Obter configurações de e-mail
const getEmailConfig = async (req, res) => {
  try {
    const envVars = readEnvFile();
    
    const emailConfig = {
      smtpHost: envVars.EMAIL_HOST || '',
      smtpPort: envVars.EMAIL_PORT || '587',
      smtpSecure: envVars.EMAIL_SECURE === 'true',
      smtpUser: envVars.EMAIL_USER || '',
      smtpPassword: envVars.EMAIL_PASSWORD ? '••••••••' : '', // Mascarar senha
      fromEmail: envVars.EMAIL_FROM_EMAIL || '',
      fromName: envVars.EMAIL_FROM_NAME || ''
    };
    
    res.json(emailConfig);
  } catch (error) {
    console.error('Erro ao obter configurações de e-mail:', error);
    res.status(500).json({ erro: 'Erro ao obter configurações de e-mail' });
  }
};

// Salvar configurações de e-mail
const saveEmailConfig = async (req, res) => {
  try {
    const { 
      smtpHost, 
      smtpPort, 
      smtpSecure, 
      smtpUser, 
      smtpPassword, 
      fromEmail, 
      fromName 
    } = req.body;

    // Validações básicas
    if (!smtpHost || !smtpPort || !smtpUser || !fromEmail) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios: servidor SMTP, porta, usuário e e-mail remetente' 
      });
    }

    const envVars = readEnvFile();
    
    // Atualizar variáveis de e-mail
    envVars.EMAIL_HOST = smtpHost;
    envVars.EMAIL_PORT = smtpPort;
    envVars.EMAIL_SECURE = smtpSecure ? 'true' : 'false';
    envVars.EMAIL_USER = smtpUser;
    envVars.EMAIL_FROM_EMAIL = fromEmail;
    envVars.EMAIL_FROM_NAME = fromName;
    
    // Só atualizar a senha se uma nova foi fornecida
    if (smtpPassword && smtpPassword !== '••••••••') {
      envVars.EMAIL_PASSWORD = smtpPassword;
    }
    
    // Salvar no arquivo .env
    const success = writeEnvFile(envVars);
    
    if (!success) {
      return res.status(500).json({ erro: 'Erro ao salvar configurações' });
    }

    // Atualizar variáveis de ambiente em tempo de execução
    process.env.EMAIL_HOST = smtpHost;
    process.env.EMAIL_PORT = smtpPort;
    process.env.EMAIL_SECURE = smtpSecure ? 'true' : 'false';
    process.env.EMAIL_USER = smtpUser;
    process.env.EMAIL_FROM_EMAIL = fromEmail;
    process.env.EMAIL_FROM_NAME = fromName;
    
    if (smtpPassword && smtpPassword !== '••••••••') {
      process.env.EMAIL_PASSWORD = smtpPassword;
    }

    res.json({ 
      sucesso: true, 
      mensagem: 'Configurações de e-mail salvas com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao salvar configurações de e-mail:', error);
    res.status(500).json({ erro: 'Erro ao salvar configurações de e-mail' });
  }
};

// Testar configuração de e-mail
const testEmailConfig = async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ erro: 'E-mail de teste é obrigatório' });
    }

    // Verificar se a configuração está válida
    const isConfigValid = await verifyEmailConfig();
    
    if (!isConfigValid) {
      return res.status(400).json({ 
        erro: 'Configuração de e-mail inválida. Verifique as configurações SMTP.' 
      });
    }

    // Enviar e-mail de teste
    const emailData = {
      to: testEmail,
      subject: 'Teste de Configuração de E-mail',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Teste de E-mail</h2>
          <p>Este é um e-mail de teste para verificar se as configurações SMTP estão funcionando corretamente.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p style="color: #666; font-size: 12px;">
            Se você recebeu este e-mail, significa que as configurações estão corretas!
          </p>
        </div>
      `
    };

    await sendEmail(emailData);

    res.json({ 
      sucesso: true, 
      mensagem: 'E-mail de teste enviado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao testar configuração de e-mail:', error);
    res.status(500).json({ 
      erro: 'Erro ao enviar e-mail de teste: ' + error.message 
    });
  }
};

module.exports = {
  getEmailConfig,
  saveEmailConfig,
  testEmailConfig
};