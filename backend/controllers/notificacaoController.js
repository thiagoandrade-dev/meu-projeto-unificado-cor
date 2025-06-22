// backend/controllers/notificacaoController.js
const Notificacao = require("../models/Notificacao");
const nodemailer = require("nodemailer");

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Obter todas as notificações (com filtro opcional por usuário)
const getAll = async (req, res) => {
  try {
    const { userId } = req.query;
    const filtro = userId ? { destinatario: userId } : {};
    
    const notificacoes = await Notificacao.find(filtro).sort({ dataEnvio: -1 });
    res.json(notificacoes);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Criar uma nova notificação
const create = async (req, res) => {
  try {
    const { titulo, mensagem, tipo, destinatario, remetente, urgente, link, metadata } = req.body;
    
    const novaNotificacao = await Notificacao.create({
      titulo,
      mensagem,
      tipo,
      destinatario,
      remetente,
      urgente: urgente || false,
      link,
      metadata
    });
    
    res.status(201).json(novaNotificacao);
  } catch (error) {
    console.error("Erro ao criar notificação:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Marcar notificação como lida
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificacao = await Notificacao.findByIdAndUpdate(
      id,
      { lida: true, dataLeitura: new Date() },
      { new: true }
    );
    
    if (!notificacao) {
      return res.status(404).json({ erro: "Notificação não encontrada." });
    }
    
    res.json(notificacao);
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Excluir notificação
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificacao = await Notificacao.findByIdAndDelete(id);
    
    if (!notificacao) {
      return res.status(404).json({ erro: "Notificação não encontrada." });
    }
    
    res.json({ mensagem: "Notificação excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir notificação:", error.message);
    res.status(500).json({ erro: `Erro interno no servidor: ${error.message}` });
  }
};

// Enviar email
const sendEmail = async (req, res) => {
  try {
    const { tipo, destinatario, assunto, dados, remetente, template } = req.body;
    
    // Verificar dados obrigatórios
    if (!destinatario || !assunto || !tipo) {
      return res.status(400).json({ erro: "Destinatário, assunto e tipo são obrigatórios." });
    }
    
    // Gerar conteúdo do email com base no template
    const conteudo = gerarConteudoEmail(tipo, dados);
    
    // Enviar email
    await transporter.sendMail({
      from: `"${remetente || 'Imobiliária Firenze'}" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: conteudo
    });
    
    // Registrar notificação no sistema
    await Notificacao.create({
      titulo: assunto,
      mensagem: `Email enviado: ${assunto}`,
      tipo: "info",
      destinatario,
      remetente: remetente || process.env.EMAIL_USER,
      metadata: { tipo, dados }
    });
    
    res.json({ mensagem: "Email enviado com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar email:", error.message);
    res.status(500).json({ erro: `Erro ao enviar email: ${error.message}` });
  }
};

// Enviar cobranças em lote
const enviarCobrancasLote = async (req, res) => {
  try {
    const { contratos, remetente } = req.body;
    
    if (!contratos || !Array.isArray(contratos) || contratos.length === 0) {
      return res.status(400).json({ erro: "Lista de contratos é obrigatória." });
    }
    
    // Aqui implementaríamos a lógica para processar cada contrato e enviar cobranças
    // Por simplicidade, apenas registramos a notificação
    
    await Notificacao.create({
      titulo: "Cobranças em lote processadas",
      mensagem: `${contratos.length} cobranças foram processadas em lote.`,
      tipo: "info",
      destinatario: "admin",
      remetente: remetente || "sistema",
      metadata: { contratos }
    });
    
    res.json({ mensagem: `${contratos.length} cobranças processadas com sucesso.` });
  } catch (error) {
    console.error("Erro ao processar cobranças em lote:", error.message);
    res.status(500).json({ erro: `Erro ao processar cobranças em lote: ${error.message}` });
  }
};

// Criar lembretes de vencimento
const criarLembretesVencimento = async (req, res) => {
  try {
    const { diasAntecedencia, remetente } = req.body;
    
    // Aqui implementaríamos a lógica para buscar contratos próximos do vencimento
    // e criar lembretes para cada um
    // Por simplicidade, apenas registramos a notificação
    
    await Notificacao.create({
      titulo: "Lembretes de vencimento criados",
      mensagem: `Lembretes de vencimento criados com ${diasAntecedencia || 7} dias de antecedência.`,
      tipo: "info",
      destinatario: "admin",
      remetente: remetente || "sistema",
      metadata: { diasAntecedencia }
    });
    
    res.json({ mensagem: "Lembretes de vencimento criados com sucesso." });
  } catch (error) {
    console.error("Erro ao criar lembretes de vencimento:", error.message);
    res.status(500).json({ erro: `Erro ao criar lembretes de vencimento: ${error.message}` });
  }
};

// Enviar notificação jurídica
const enviarNotificacaoJuridica = async (req, res) => {
  try {
    const { tipo, destinatario, dados, remetente } = req.body;
    
    if (!tipo || !destinatario || !dados) {
      return res.status(400).json({ erro: "Tipo, destinatário e dados são obrigatórios." });
    }
    
    // Aqui implementaríamos a lógica para processar a notificação jurídica
    // Por simplicidade, apenas registramos a notificação
    
    await Notificacao.create({
      titulo: `Notificação jurídica: ${tipo}`,
      mensagem: `Uma notificação jurídica do tipo ${tipo} foi enviada.`,
      tipo: "warning",
      destinatario,
      remetente: remetente || "juridico@imobiliariafirenze.com.br",
      urgente: true,
      metadata: { tipo, dados }
    });
    
    res.json({ mensagem: "Notificação jurídica enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar notificação jurídica:", error.message);
    res.status(500).json({ erro: `Erro ao enviar notificação jurídica: ${error.message}` });
  }
};

// Função auxiliar para gerar conteúdo de email com base no tipo
const gerarConteudoEmail = (tipo, dados) => {
  switch (tipo) {
    case "cobranca":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Cobrança de Aluguel</h2>
          <p>Prezado(a) ${dados.nome || "Cliente"},</p>
          <p>Informamos que está disponível a cobrança referente ao aluguel do imóvel ${dados.imovel || ""}.</p>
          <p><strong>Valor:</strong> R$ ${dados.valor || "0,00"}</p>
          <p><strong>Vencimento:</strong> ${dados.vencimento || "00/00/0000"}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dados.linkBoleto || "#"}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Visualizar Boleto</a>
          </div>
          <p>Em caso de dúvidas, entre em contato conosco.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">Imobiliária Firenze - Todos os direitos reservados.</p>
        </div>
      `;
    
    case "juridico":
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Notificação Jurídica</h2>
          <p>Prezado(a) ${dados.nome || "Cliente"},</p>
          <p>${dados.mensagem || "Você recebeu uma notificação jurídica importante."}</p>
          <p>Por favor, entre em contato com nosso departamento jurídico o mais breve possível.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">Imobiliária Firenze - Todos os direitos reservados.</p>
        </div>
      `;
    
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Comunicado</h2>
          <p>Prezado(a) ${dados.nome || "Cliente"},</p>
          <p>${dados.mensagem || "Você recebeu um comunicado da Imobiliária Firenze."}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">Imobiliária Firenze - Todos os direitos reservados.</p>
        </div>
      `;
  }
};

module.exports = {
  getAll,
  create,
  markAsRead,
  deleteNotification,
  sendEmail,
  enviarCobrancasLote,
  criarLembretesVencimento,
  enviarNotificacaoJuridica
};

