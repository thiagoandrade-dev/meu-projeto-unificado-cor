// backend/controllers/notificacaoAutomaticaController.js
const notificacaoService = require('../services/notificacaoAutomaticaService');
const agendadorNotificacoes = require('../services/agendadorNotificacoes');
const Inquilino = require('../models/Inquilino');
const Contrato = require('../models/Contrato');

class NotificacaoAutomaticaController {

  // 📊 Obter status do sistema de notificações
  async obterStatus(req, res) {
    try {
      const status = agendadorNotificacoes.obterStatus();
      
      res.json({
        success: true,
        data: {
          ...status,
          sistemaAtivo: status.isRunning,
          ultimaVerificacao: new Date().toISOString(),
          configuracoes: {
            aniversarios: { ativo: true, horario: '09:00', frequencia: 'Diário' },
            vencimentosAluguel: { ativo: true, horario: '08:00', frequencia: 'Diário' },
            vencimentosContrato: { ativo: true, horario: '10:00', frequencia: 'Segunda-feira' },
            relatorioSemanal: { ativo: true, horario: '17:00', frequencia: 'Sexta-feira' }
          }
        }
      });
    } catch (error) {
      console.error('❌ Erro ao obter status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter status do sistema',
        error: error.message
      });
    }
  }

  // 🚀 Iniciar sistema de notificações automáticas
  async iniciarSistema(req, res) {
    try {
      agendadorNotificacoes.iniciar();
      
      res.json({
        success: true,
        message: '🚀 Sistema de notificações automáticas iniciado com sucesso!',
        data: agendadorNotificacoes.obterStatus()
      });
    } catch (error) {
      console.error('❌ Erro ao iniciar sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar sistema de notificações',
        error: error.message
      });
    }
  }

  // 🛑 Parar sistema de notificações automáticas
  async pararSistema(req, res) {
    try {
      agendadorNotificacoes.parar();
      
      res.json({
        success: true,
        message: '🛑 Sistema de notificações automáticas parado com sucesso!',
        data: agendadorNotificacoes.obterStatus()
      });
    } catch (error) {
      console.error('❌ Erro ao parar sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao parar sistema de notificações',
        error: error.message
      });
    }
  }

  // 🔧 Executar verificação manual
  async executarVerificacaoManual(req, res) {
    try {
      await agendadorNotificacoes.executarVerificacaoManual();
      
      res.json({
        success: true,
        message: '🔧 Verificação manual executada com sucesso!',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro na verificação manual:', error);
      res.status(500).json({
        success: false,
        message: 'Erro na verificação manual',
        error: error.message
      });
    }
  }

  // 🎂 Testar envio de parabéns (para desenvolvimento)
  async testarParabens(req, res) {
    try {
      const { inquilinoId, nome, email, idade } = req.body;

      if (!nome || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nome e email são obrigatórios'
        });
      }

      const inquilinoTeste = {
        _id: inquilinoId || 'teste',
        nome,
        email,
        idade: idade || null
      };

      await notificacaoService.enviarParabensAniversario(inquilinoTeste);

      res.json({
        success: true,
        message: `🎂 E-mail de parabéns enviado com sucesso para ${nome}!`,
        data: {
          destinatario: email,
          tipo: 'aniversario',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Erro ao testar parabéns:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar e-mail de parabéns',
        error: error.message
      });
    }
  }

  // 👋 Testar envio de boas-vindas
  async testarBoasVindas(req, res) {
    try {
      const { nome, email, tipoUsuario } = req.body;

      if (!nome || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nome e email são obrigatórios'
        });
      }

      const usuarioTeste = {
        _id: 'teste',
        nome,
        email
      };

      await notificacaoService.enviarBoasVindas(usuarioTeste, tipoUsuario || 'inquilino');

      res.json({
        success: true,
        message: `👋 E-mail de boas-vindas enviado com sucesso para ${nome}!`,
        data: {
          destinatario: email,
          tipo: 'boas-vindas',
          tipoUsuario: tipoUsuario || 'inquilino',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Erro ao testar boas-vindas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar e-mail de boas-vindas',
        error: error.message
      });
    }
  }

  // 💰 Testar lembrete de vencimento
  async testarLembreteVencimento(req, res) {
    try {
      const { 
        nomeInquilino, 
        emailInquilino, 
        valorAluguel, 
        dataVencimento, 
        diasRestantes 
      } = req.body;

      if (!nomeInquilino || !emailInquilino || !valorAluguel || !dataVencimento) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }

      const contratoTeste = {
        _id: 'teste',
        valorAluguel: parseFloat(valorAluguel),
        dataVencimento: new Date(dataVencimento),
        inquilino: {
          nome: nomeInquilino,
          email: emailInquilino
        }
      };

      await notificacaoService.enviarLembreteVencimentoAluguel(contratoTeste, diasRestantes || 7);

      res.json({
        success: true,
        message: `💰 Lembrete de vencimento enviado com sucesso para ${nomeInquilino}!`,
        data: {
          destinatario: emailInquilino,
          tipo: 'vencimento-aluguel',
          valor: valorAluguel,
          vencimento: dataVencimento,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Erro ao testar lembrete:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar lembrete de vencimento',
        error: error.message
      });
    }
  }

  // 📈 Testar notificação de reajuste
  async testarReajuste(req, res) {
    try {
      const { 
        nomeInquilino, 
        emailInquilino, 
        valorAtual, 
        percentualReajuste, 
        dataVigencia 
      } = req.body;

      if (!nomeInquilino || !emailInquilino || !valorAtual || !percentualReajuste || !dataVigencia) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }

      const contratoTeste = {
        _id: 'teste',
        valorAluguel: parseFloat(valorAtual),
        inquilino: {
          nome: nomeInquilino,
          email: emailInquilino
        }
      };

      await notificacaoService.enviarNotificacaoReajuste(
        contratoTeste, 
        parseFloat(percentualReajuste), 
        new Date(dataVigencia)
      );

      res.json({
        success: true,
        message: `📈 Notificação de reajuste enviada com sucesso para ${nomeInquilino}!`,
        data: {
          destinatario: emailInquilino,
          tipo: 'reajuste-anual',
          valorAtual: valorAtual,
          percentualReajuste: percentualReajuste,
          dataVigencia: dataVigencia,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Erro ao testar reajuste:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar notificação de reajuste',
        error: error.message
      });
    }
  }

  // 🏠 Testar vencimento de contrato
  async testarVencimentoContrato(req, res) {
    try {
      const { 
        nomeInquilino, 
        emailInquilino, 
        enderecoImovel, 
        dataVencimento, 
        diasRestantes 
      } = req.body;

      if (!nomeInquilino || !emailInquilino || !enderecoImovel || !dataVencimento) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios'
        });
      }

      const contratoTeste = {
        _id: 'teste',
        dataFim: new Date(dataVencimento),
        inquilino: {
          nome: nomeInquilino,
          email: emailInquilino
        },
        imovel: {
          endereco: enderecoImovel
        }
      };

      await notificacaoService.enviarLembreteVencimentoContrato(contratoTeste, diasRestantes || 60);

      res.json({
        success: true,
        message: `🏠 Lembrete de vencimento de contrato enviado com sucesso para ${nomeInquilino}!`,
        data: {
          destinatario: emailInquilino,
          tipo: 'vencimento-contrato',
          endereco: enderecoImovel,
          vencimento: dataVencimento,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Erro ao testar vencimento de contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar lembrete de vencimento de contrato',
        error: error.message
      });
    }
  }

  // 📋 Listar tipos de notificação disponíveis
  async listarTiposNotificacao(req, res) {
    try {
      const tipos = [
        {
          id: 'aniversario',
          nome: '🎂 Parabéns de Aniversário',
          descricao: 'E-mail automático de parabéns no aniversário do inquilino',
          frequencia: 'Anual',
          ativo: true
        },
        {
          id: 'boas-vindas',
          nome: '👋 Boas-vindas',
          descricao: 'E-mail de boas-vindas para novos usuários',
          frequencia: 'Único',
          ativo: true
        },
        {
          id: 'vencimento-aluguel',
          nome: '💰 Vencimento de Aluguel',
          descricao: 'Lembrete de vencimento de aluguel (7 dias antes)',
          frequencia: 'Mensal',
          ativo: true
        },
        {
          id: 'reajuste-anual',
          nome: '📈 Reajuste Anual',
          descricao: 'Notificação de reajuste anual de aluguel',
          frequencia: 'Anual',
          ativo: true
        },
        {
          id: 'vencimento-contrato',
          nome: '🏠 Vencimento de Contrato',
          descricao: 'Lembrete de vencimento de contrato (60 dias antes)',
          frequencia: 'Conforme contrato',
          ativo: true
        }
      ];

      res.json({
        success: true,
        data: tipos,
        total: tipos.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar tipos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar tipos de notificação',
        error: error.message
      });
    }
  }
}

module.exports = new NotificacaoAutomaticaController();