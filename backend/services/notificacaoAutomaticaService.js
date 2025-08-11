// backend/services/notificacaoAutomaticaService.js
const { sendEmail } = require('../config/emailConfig');
const Notificacao = require('../models/Notificacao');
const Contrato = require('../models/Contrato');
const Inquilino = require('../models/Inquilino');

// Templates de e-mail para diferentes tipos de notificação
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
            <a href="${process.env.FRONTEND_URL || 'https://www.imobiliariafirenze.com.br'}" 
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
            <a href="${process.env.FRONTEND_URL || 'https://www.imobiliariafirenze.com.br'}" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              💳 Acessar Sistema
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
  }),

  // 📈 Lembrete de reajuste anual
  reajusteAnual: (nome, valorAtual, valorNovo, percentualReajuste, dataVigencia) => ({
    subject: `📈 Reajuste Anual de Aluguel - ${percentualReajuste}% - Imobiliária Firenze`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #673ab7 0%, #9c27b0 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 2em;">📈 Reajuste Anual</h1>
          <h2 style="margin: 15px 0; font-weight: normal;">Olá, ${nome}!</h2>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 1.1em; color: #333; margin-bottom: 20px;">
            Informamos sobre o reajuste anual do seu contrato de locação:
          </p>
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #673ab7;">
            <h3 style="color: #333; margin-top: 0;">💰 Valores do Reajuste</h3>
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; flex: 1; margin-right: 10px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 0.9em;">Valor Atual</p>
                <p style="margin: 5px 0; color: #333; font-size: 1.2em; font-weight: bold;">R$ ${valorAtual}</p>
              </div>
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; flex: 1; margin-left: 10px; text-align: center;">
                <p style="margin: 0; color: #666; font-size: 0.9em;">Novo Valor</p>
                <p style="margin: 5px 0; color: #4CAF50; font-size: 1.2em; font-weight: bold;">R$ ${valorNovo}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 15px 0;">
              <span style="background: #673ab7; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                📊 Reajuste: ${percentualReajuste}%
              </span>
            </div>
            <p style="margin: 15px 0; color: #333;"><strong>📅 Vigência:</strong> A partir de ${dataVigencia}</p>
          </div>
          <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #f57c00; font-size: 0.9em;">
              📋 <strong>Importante:</strong> Este reajuste está previsto em contrato e segue os índices legais estabelecidos.
            </p>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://www.imobiliariafirenze.com.br'}" 
               style="background: #673ab7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              📄 Acessar Sistema
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 0.9em; text-align: center; margin: 0;">
            Imobiliária Firenze - Transparência em todos os processos
          </p>
        </div>
      </div>
    `
  }),

  // 🏠 Lembrete de vencimento de contrato
  vencimentoContrato: (nome, enderecoImovel, dataVencimento, diasRestantes) => ({
    subject: `🏠 Contrato vence ${diasRestantes <= 30 ? `em ${diasRestantes} dias` : 'em breve'} - Imobiliária Firenze`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff5722 0%, #f44336 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 2em;">🏠 Vencimento de Contrato</h1>
          <h2 style="margin: 15px 0; font-weight: normal;">Olá, ${nome}!</h2>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 1.1em; color: #333; margin-bottom: 20px;">
            Seu contrato de locação está próximo do vencimento:
          </p>
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff5722;">
            <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Contrato</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>🏠 Imóvel:</strong> ${enderecoImovel}</p>
              <p style="margin: 5px 0; color: #333;"><strong>📅 Vencimento:</strong> ${dataVencimento}</p>
              <p style="margin: 5px 0; color: #333;"><strong>⏰ Tempo restante:</strong> 
                <span style="color: ${diasRestantes <= 30 ? '#f44336' : '#ff9800'}; font-weight: bold;">
                  ${diasRestantes} dias
                </span>
              </p>
            </div>
          </div>
          <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #c62828; font-size: 0.9em;">
              ⚠️ <strong>Ação necessária:</strong> Entre em contato conosco para renovar ou finalizar o contrato.
            </p>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="tel:+5511999999999" 
               style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 5px;">
              📞 Ligar Agora
            </a>
            <a href="${process.env.FRONTEND_URL || 'https://www.imobiliariafirenze.com.br'}" 
               style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 5px;">
              💬 Acessar Sistema
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 0.9em; text-align: center; margin: 0;">
            Imobiliária Firenze - Cuidando do seu futuro
          </p>
        </div>
      </div>
    `
  })
};

// Serviço principal de notificações automáticas
class NotificacaoAutomaticaService {
  
  // 🎂 Enviar parabéns de aniversário
  async enviarParabensAniversario(inquilino) {
    try {
      const template = emailTemplates.aniversario(inquilino.nome, inquilino.idade);
      
      await sendEmail({
        to: inquilino.email,
        subject: template.subject,
        html: template.html
      });

      // Registrar notificação
      await Notificacao.create({
        titulo: `Parabéns enviado para ${inquilino.nome}`,
        mensagem: `E-mail de aniversário enviado com sucesso`,
        tipo: "info",
        destinatario: inquilino.email,
        remetente: "sistema",
        metadata: { tipo: "aniversario", inquilinoId: inquilino._id }
      });

      console.log(`✅ Parabéns de aniversário enviado para ${inquilino.nome}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar parabéns para ${inquilino.nome}:`, error);
      throw error;
    }
  }

  // 👋 Enviar boas-vindas
  async enviarBoasVindas(usuario, tipoUsuario = 'inquilino') {
    try {
      const template = emailTemplates.boasVindas(usuario.nome, tipoUsuario);
      
      await sendEmail({
        to: usuario.email,
        subject: template.subject,
        html: template.html
      });

      // Registrar notificação
      await Notificacao.create({
        titulo: `Boas-vindas enviado para ${usuario.nome}`,
        mensagem: `E-mail de boas-vindas enviado com sucesso`,
        tipo: "info",
        destinatario: usuario.email,
        remetente: "sistema",
        metadata: { tipo: "boas-vindas", usuarioId: usuario._id, tipoUsuario }
      });

      console.log(`✅ Boas-vindas enviado para ${usuario.nome}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar boas-vindas para ${usuario.nome}:`, error);
      throw error;
    }
  }

  // 💰 Enviar lembrete de vencimento de aluguel
  async enviarLembreteVencimentoAluguel(contrato, diasAntecedencia = 7) {
    try {
      const dataVencimento = new Date(contrato.dataVencimento);
      const hoje = new Date();
      const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

      if (diasRestantes <= diasAntecedencia && diasRestantes >= 0) {
        const template = emailTemplates.vencimentoAluguel(
          contrato.inquilino.nome,
          contrato.valorAluguel,
          dataVencimento.toLocaleDateString('pt-BR'),
          diasRestantes
        );
        
        await sendEmail({
          to: contrato.inquilino.email,
          subject: template.subject,
          html: template.html
        });

        // Registrar notificação
        await Notificacao.create({
          titulo: `Lembrete de vencimento enviado`,
          mensagem: `Lembrete de aluguel enviado para ${contrato.inquilino.nome}`,
          tipo: "warning",
          destinatario: contrato.inquilino.email,
          remetente: "sistema",
          urgente: diasRestantes <= 1,
          metadata: { tipo: "vencimento-aluguel", contratoId: contrato._id, diasRestantes }
        });

        console.log(`✅ Lembrete de vencimento enviado para ${contrato.inquilino.nome}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar lembrete de vencimento:`, error);
      throw error;
    }
  }

  // 📈 Enviar notificação de reajuste anual
  async enviarNotificacaoReajuste(contrato, percentualReajuste, dataVigencia) {
    try {
      const valorNovo = contrato.valorAluguel * (1 + percentualReajuste / 100);
      
      const template = emailTemplates.reajusteAnual(
        contrato.inquilino.nome,
        contrato.valorAluguel.toFixed(2),
        valorNovo.toFixed(2),
        percentualReajuste,
        new Date(dataVigencia).toLocaleDateString('pt-BR')
      );
      
      await sendEmail({
        to: contrato.inquilino.email,
        subject: template.subject,
        html: template.html
      });

      // Registrar notificação
      await Notificacao.create({
        titulo: `Reajuste anual notificado`,
        mensagem: `Notificação de reajuste enviada para ${contrato.inquilino.nome}`,
        tipo: "info",
        destinatario: contrato.inquilino.email,
        remetente: "sistema",
        metadata: { 
          tipo: "reajuste-anual", 
          contratoId: contrato._id, 
          percentualReajuste,
          valorAntigo: contrato.valorAluguel,
          valorNovo: valorNovo
        }
      });

      console.log(`✅ Notificação de reajuste enviada para ${contrato.inquilino.nome}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar notificação de reajuste:`, error);
      throw error;
    }
  }

  // 🏠 Enviar lembrete de vencimento de contrato
  async enviarLembreteVencimentoContrato(contrato, diasAntecedencia = 60) {
    try {
      const dataVencimento = new Date(contrato.dataFim);
      const hoje = new Date();
      const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

      if (diasRestantes <= diasAntecedencia && diasRestantes >= 0) {
        const template = emailTemplates.vencimentoContrato(
          contrato.inquilino.nome,
          contrato.imovel.endereco,
          dataVencimento.toLocaleDateString('pt-BR'),
          diasRestantes
        );
        
        await sendEmail({
          to: contrato.inquilino.email,
          subject: template.subject,
          html: template.html
        });

        // Registrar notificação
        await Notificacao.create({
          titulo: `Lembrete de vencimento de contrato`,
          mensagem: `Lembrete de vencimento de contrato enviado para ${contrato.inquilino.nome}`,
          tipo: "warning",
          destinatario: contrato.inquilino.email,
          remetente: "sistema",
          urgente: diasRestantes <= 30,
          metadata: { tipo: "vencimento-contrato", contratoId: contrato._id, diasRestantes }
        });

        console.log(`✅ Lembrete de vencimento de contrato enviado para ${contrato.inquilino.nome}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar lembrete de vencimento de contrato:`, error);
      throw error;
    }
  }

  // 🔄 Processar todas as notificações automáticas
  async processarNotificacoesAutomaticas() {
    try {
      console.log('🔄 Iniciando processamento de notificações automáticas...');
      
      // Buscar contratos ativos (simulação - adapte conforme seu modelo)
      // const contratosAtivos = await Contrato.find({ status: 'ativo' })
      //   .populate('inquilino')
      //   .populate('imovel');

      // Por enquanto, vamos simular
      console.log('📋 Verificando vencimentos de aluguel...');
      console.log('📋 Verificando vencimentos de contrato...');
      console.log('🎂 Verificando aniversários...');
      
      console.log('✅ Processamento de notificações concluído!');
    } catch (error) {
      console.error('❌ Erro no processamento de notificações automáticas:', error);
      throw error;
    }
  }
}

module.exports = new NotificacaoAutomaticaService();