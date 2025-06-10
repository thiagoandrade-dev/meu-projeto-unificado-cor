// Local: backend/controllers/notificacao.controller.js

const nodemailer = require('nodemailer');

// A função que será chamada pela nossa rota
exports.sendNotification = async (req, res) => {
  // 1. Pegamos os dados que o frontend enviou (assunto, corpo, destinatario, etc.)
  const { destinatario, assunto, corpo, remetente } = req.body;

  // 2. Verificação simples para garantir que os dados essenciais chegaram
  if (!destinatario || !assunto || !corpo) {
    return res.status(400).json({ message: 'Dados da notificação (destinatario, assunto, corpo) são obrigatórios.' });
  }

  // 3. Configuração do serviço de e-mail (usando Gmail como exemplo)
  //    IMPORTANTE: Você precisa usar suas próprias credenciais aqui.
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Servidor SMTP do Gmail
    port: 465,              // Porta do servidor
    secure: true,           // Usar SSL
    auth: {
      user: process.env.EMAIL_USER, // Seu e-mail, colocado no arquivo .env
      pass: process.env.EMAIL_PASS  // Sua SENHA DE APLICATIVO, colocada no .env
    }
  });

  try {
    // 4. Monta e envia o e-mail
    await transporter.sendMail({
      from: `"${remetente || 'Imobiliária Firenze'}" <${process.env.EMAIL_USER}>`, // Remetente
      to: destinatario,      // Destinatário
      subject: assunto,      // Assunto do e-mail
      html: `<p>${corpo}</p>` // Corpo do e-mail (pode ser HTML)
    });

    // 5. Se tudo deu certo, responde ao frontend com sucesso
    res.status(200).json({ message: 'Notificação enviada com sucesso!' });

  } catch (error) {
    console.error('Erro ao enviar notificação por e-mail:', error);
    res.status(500).json({ message: 'Falha no servidor ao enviar notificação.' });
  }
};