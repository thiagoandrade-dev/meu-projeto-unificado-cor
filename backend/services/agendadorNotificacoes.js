// backend/services/agendadorNotificacoes.js
const cron = require('node-cron');
const notificacaoService = require('./notificacaoAutomaticaService');
const Contrato = require('../models/Contrato');
const Inquilino = require('../models/Inquilino');

class AgendadorNotificacoes {
  constructor() {
    this.tarefasAgendadas = [];
    this.isRunning = false;
  }

  // 🚀 Iniciar todos os agendamentos
  iniciar() {
    if (this.isRunning) {
      console.log('⚠️ Agendador já está em execução');
      return;
    }

    console.log('🚀 Iniciando agendador de notificações automáticas...');
    
    // 🎂 Verificar aniversários todos os dias às 9h
    this.agendarVerificacaoAniversarios();
    
    // 💰 Verificar vencimentos de aluguel todos os dias às 8h
    this.agendarVerificacaoVencimentos();
    
    // 🏠 Verificar vencimentos de contrato toda segunda-feira às 10h
    this.agendarVerificacaoContratosVencendo();
    
    // 📊 Relatório semanal de notificações (sexta-feira às 17h)
    this.agendarRelatorioSemanal();

    this.isRunning = true;
    console.log('✅ Agendador de notificações iniciado com sucesso!');
    console.log('📅 Tarefas agendadas:', this.tarefasAgendadas.length);
  }

  // 🛑 Parar todos os agendamentos
  parar() {
    console.log('🛑 Parando agendador de notificações...');
    
    this.tarefasAgendadas.forEach(tarefa => {
      if (tarefa.destroy) {
        tarefa.destroy();
      }
    });
    
    this.tarefasAgendadas = [];
    this.isRunning = false;
    console.log('✅ Agendador parado com sucesso!');
  }

  // 🎂 Agendar verificação de aniversários (todos os dias às 9h)
  agendarVerificacaoAniversarios() {
    const tarefa = cron.schedule('0 9 * * *', async () => {
      try {
        console.log('🎂 Verificando aniversários do dia...');
        await this.verificarAniversarios();
      } catch (error) {
        console.error('❌ Erro na verificação de aniversários:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Sao_Paulo"
    });

    this.tarefasAgendadas.push(tarefa);
    tarefa.start();
    console.log('📅 Agendamento de aniversários configurado (9h diariamente)');
  }

  // 💰 Agendar verificação de vencimentos (todos os dias às 8h)
  agendarVerificacaoVencimentos() {
    const tarefa = cron.schedule('0 8 * * *', async () => {
      try {
        console.log('💰 Verificando vencimentos de aluguel...');
        await this.verificarVencimentosAluguel();
      } catch (error) {
        console.error('❌ Erro na verificação de vencimentos:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Sao_Paulo"
    });

    this.tarefasAgendadas.push(tarefa);
    tarefa.start();
    console.log('📅 Agendamento de vencimentos configurado (8h diariamente)');
  }

  // 🏠 Agendar verificação de contratos vencendo (segunda-feira às 10h)
  agendarVerificacaoContratosVencendo() {
    const tarefa = cron.schedule('0 10 * * 1', async () => {
      try {
        console.log('🏠 Verificando contratos próximos do vencimento...');
        await this.verificarContratosVencendo();
      } catch (error) {
        console.error('❌ Erro na verificação de contratos:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Sao_Paulo"
    });

    this.tarefasAgendadas.push(tarefa);
    tarefa.start();
    console.log('📅 Agendamento de contratos configurado (segunda-feira 10h)');
  }

  // 📊 Agendar relatório semanal (sexta-feira às 17h)
  agendarRelatorioSemanal() {
    const tarefa = cron.schedule('0 17 * * 5', async () => {
      try {
        console.log('📊 Gerando relatório semanal de notificações...');
        await this.gerarRelatorioSemanal();
      } catch (error) {
        console.error('❌ Erro no relatório semanal:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/Sao_Paulo"
    });

    this.tarefasAgendadas.push(tarefa);
    tarefa.start();
    console.log('📅 Relatório semanal configurado (sexta-feira 17h)');
  }

  // 🎂 Verificar aniversários do dia
  async verificarAniversarios() {
    try {
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      const mesHoje = hoje.getMonth() + 1; // JavaScript months are 0-indexed

      // Buscar inquilinos que fazem aniversário hoje
      // Simulação - adapte conforme seu modelo de dados
      console.log(`🔍 Buscando aniversariantes do dia ${diaHoje}/${mesHoje}...`);
      
      // Exemplo de como seria a busca real:
      // const aniversariantes = await Inquilino.find({
      //   $expr: {
      //     $and: [
      //       { $eq: [{ $dayOfMonth: "$dataNascimento" }, diaHoje] },
      //       { $eq: [{ $month: "$dataNascimento" }, mesHoje] }
      //     ]
      //   }
      // });

      // Por enquanto, simulação
      const aniversariantes = []; // Substitua pela busca real

      if (aniversariantes.length > 0) {
        console.log(`🎉 Encontrados ${aniversariantes.length} aniversariante(s)!`);
        
        for (const inquilino of aniversariantes) {
          await notificacaoService.enviarParabensAniversario(inquilino);
        }
      } else {
        console.log('📅 Nenhum aniversariante hoje');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar aniversários:', error);
      throw error;
    }
  }

  // 💰 Verificar vencimentos de aluguel
  async verificarVencimentosAluguel() {
    try {
      const hoje = new Date();
      const em7Dias = new Date(hoje.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      console.log('🔍 Buscando aluguéis próximos do vencimento...');
      
      // Buscar contratos com vencimento nos próximos 7 dias
      // Simulação - adapte conforme seu modelo
      // const contratosVencendo = await Contrato.find({
      //   dataVencimento: {
      //     $gte: hoje,
      //     $lte: em7Dias
      //   },
      //   status: 'ativo'
      // }).populate('inquilino').populate('imovel');

      // Por enquanto, simulação
      const contratosVencendo = []; // Substitua pela busca real

      if (contratosVencendo.length > 0) {
        console.log(`💰 Encontrados ${contratosVencendo.length} vencimento(s) próximo(s)!`);
        
        for (const contrato of contratosVencendo) {
          await notificacaoService.enviarLembreteVencimentoAluguel(contrato);
        }
      } else {
        console.log('📅 Nenhum vencimento de aluguel nos próximos 7 dias');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar vencimentos de aluguel:', error);
      throw error;
    }
  }

  // 🏠 Verificar contratos próximos do vencimento
  async verificarContratosVencendo() {
    try {
      const hoje = new Date();
      const em60Dias = new Date(hoje.getTime() + (60 * 24 * 60 * 60 * 1000));
      
      console.log('🔍 Buscando contratos próximos do vencimento...');
      
      // Buscar contratos com vencimento nos próximos 60 dias
      // Simulação - adapte conforme seu modelo
      // const contratosVencendo = await Contrato.find({
      //   dataFim: {
      //     $gte: hoje,
      //     $lte: em60Dias
      //   },
      //   status: 'ativo'
      // }).populate('inquilino').populate('imovel');

      // Por enquanto, simulação
      const contratosVencendo = []; // Substitua pela busca real

      if (contratosVencendo.length > 0) {
        console.log(`🏠 Encontrados ${contratosVencendo.length} contrato(s) vencendo!`);
        
        for (const contrato of contratosVencendo) {
          await notificacaoService.enviarLembreteVencimentoContrato(contrato);
        }
      } else {
        console.log('📅 Nenhum contrato vencendo nos próximos 60 dias');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar contratos vencendo:', error);
      throw error;
    }
  }

  // 📊 Gerar relatório semanal
  async gerarRelatorioSemanal() {
    try {
      console.log('📊 Gerando relatório semanal de notificações...');
      
      // Aqui você pode implementar um relatório das notificações enviadas
      // Por exemplo, contar quantos e-mails foram enviados na semana
      
      console.log('✅ Relatório semanal gerado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao gerar relatório semanal:', error);
      throw error;
    }
  }

  // 🔧 Executar verificação manual (para testes)
  async executarVerificacaoManual() {
    try {
      console.log('🔧 Executando verificação manual de todas as notificações...');
      
      await this.verificarAniversarios();
      await this.verificarVencimentosAluguel();
      await this.verificarContratosVencendo();
      
      console.log('✅ Verificação manual concluída!');
    } catch (error) {
      console.error('❌ Erro na verificação manual:', error);
      throw error;
    }
  }

  // 📋 Obter status do agendador
  obterStatus() {
    return {
      isRunning: this.isRunning,
      tarefasAgendadas: this.tarefasAgendadas.length,
      proximasExecucoes: {
        aniversarios: '9:00 (diariamente)',
        vencimentos: '8:00 (diariamente)',
        contratos: '10:00 (segunda-feira)',
        relatorio: '17:00 (sexta-feira)'
      }
    };
  }
}

module.exports = new AgendadorNotificacoes();