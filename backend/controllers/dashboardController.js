// backend/controllers/dashboardController.js
const Imovel = require('../models/Imovel');
const Contrato = require('../models/Contrato');
const Inquilino = require('../models/Inquilino');

/**
 * Controlador para o dashboard administrativo
 */
const dashboardController = {
  /**
   * Obtém estatísticas gerais para o dashboard
   */
  async getEstatisticas(req, res) {
    try {
      // Contagem de imóveis
      const totalImoveis = await Imovel.countDocuments({});
      
      // Contagem de contratos ativos
      const contratosAtivos = await Contrato.countDocuments({ status: 'Ativo' });
      
      // Contagem de inquilinos
      const totalInquilinos = await Inquilino.countDocuments({ perfil: 'inquilino' });
      
      // Cálculo da taxa de ocupação
      const imoveisOcupados = await Imovel.countDocuments({ status: 'Ocupado' });
      const taxaOcupacao = totalImoveis > 0 ? Math.round((imoveisOcupados / totalImoveis) * 100) : 0;
      
      // Cálculo da receita mensal
      const contratos = await Contrato.find({ status: 'Ativo' });
      const receitaMensal = contratos.reduce((total, contrato) => total + contrato.valorAluguel, 0);
      
      // Cálculo da inadimplência (contratos com pagamentos atrasados)
      const hoje = new Date();
      const contratosPagamentosAtrasados = await Contrato.countDocuments({
        status: 'Ativo',
        'pagamentos.status': 'Atrasado'
      });
      
      const taxaInadimplencia = contratosAtivos > 0 
        ? Math.round((contratosPagamentosAtrasados / contratosAtivos) * 100) 
        : 0;
      
      res.status(200).json({
        totalImoveis,
        contratosAtivos,
        totalInquilinos,
        taxaOcupacao,
        receitaMensal,
        taxaInadimplencia
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas do dashboard:", error);
      res.status(500).json({ 
        message: "Erro ao obter estatísticas do dashboard",
        error: error.message 
      });
    }
  },

  /**
   * Obtém dados para o gráfico de receita mensal
   */
  async getReceitaMensal(req, res) {
    try {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const anoAtual = new Date().getFullYear();
      
      // Obter todos os contratos ativos
      const contratos = await Contrato.find({ status: 'Ativo' });
      
      // Calcular receita por mês
      const receitaPorMes = Array(12).fill(0);
      
      // Simular metas mensais (crescimento de 2% ao mês)
      const metaBase = 150000;
      const metasPorMes = Array(12).fill(0).map((_, i) => 
        Math.round(metaBase * (1 + (0.02 * i)))
      );
      
      // Preencher dados reais para os meses passados
      const mesAtual = new Date().getMonth();
      
      for (let i = 0; i <= mesAtual; i++) {
        // Simular receita com variação aleatória em torno da meta
        const variacao = Math.random() * 0.2 - 0.1; // -10% a +10%
        receitaPorMes[i] = Math.round(metasPorMes[i] * (1 + variacao));
      }
      
      // Formatar dados para o gráfico
      const dadosGrafico = meses.map((mes, index) => ({
        mes,
        valor: receitaPorMes[index],
        meta: metasPorMes[index]
      })).slice(0, mesAtual + 1);
      
      res.status(200).json(dadosGrafico);
    } catch (error) {
      console.error("Erro ao obter dados de receita mensal:", error);
      res.status(500).json({ 
        message: "Erro ao obter dados de receita mensal",
        error: error.message 
      });
    }
  },

  /**
   * Obtém dados para o gráfico de ocupação
   */
  async getOcupacao(req, res) {
    try {
      // Contagem de imóveis por status
      const ocupados = await Imovel.countDocuments({ status: 'Ocupado' });
      const disponiveis = await Imovel.countDocuments({ status: 'Disponível' });
      const manutencao = await Imovel.countDocuments({ status: 'Manutenção' });
      const reservados = await Imovel.countDocuments({ status: 'Reservado' });
      
      const total = ocupados + disponiveis + manutencao + reservados;
      
      // Calcular percentuais
      const calcularPercentual = (valor) => total > 0 ? Math.round((valor / total) * 100) : 0;
      
      const dadosGrafico = [
        { nome: 'Ocupados', valor: calcularPercentual(ocupados), cor: '#10B981' },
        { nome: 'Disponíveis', valor: calcularPercentual(disponiveis), cor: '#F59E0B' },
        { nome: 'Manutenção', valor: calcularPercentual(manutencao), cor: '#EF4444' },
        { nome: 'Reservados', valor: calcularPercentual(reservados), cor: '#8B5CF6' }
      ];
      
      res.status(200).json(dadosGrafico);
    } catch (error) {
      console.error("Erro ao obter dados de ocupação:", error);
      res.status(500).json({ 
        message: "Erro ao obter dados de ocupação",
        error: error.message 
      });
    }
  },

  /**
   * Obtém dados para o gráfico de receita por tipo de imóvel
   */
  async getReceitaPorTipoImovel(req, res) {
    try {
      // Obter todos os imóveis com contratos ativos
      const imoveis = await Imovel.find().populate({
        path: 'contratos',
        match: { status: 'Ativo' }
      });
      
      // Agrupar por tipo e calcular receita
      const receitaPorTipo = {};
      const quantidadePorTipo = {};
      
      imoveis.forEach(imovel => {
        if (!imovel.contratos || imovel.contratos.length === 0) return;
        
        const tipo = imovel.tipo;
        if (!receitaPorTipo[tipo]) {
          receitaPorTipo[tipo] = 0;
          quantidadePorTipo[tipo] = 0;
        }
        
        imovel.contratos.forEach(contrato => {
          receitaPorTipo[tipo] += contrato.valorAluguel;
        });
        
        quantidadePorTipo[tipo]++;
      });
      
      // Formatar dados para o gráfico
      const dadosGrafico = Object.keys(receitaPorTipo).map(tipo => ({
        categoria: tipo,
        quantidade: quantidadePorTipo[tipo],
        receita: receitaPorTipo[tipo]
      }));
      
      res.status(200).json(dadosGrafico);
    } catch (error) {
      console.error("Erro ao obter dados de receita por tipo de imóvel:", error);
      res.status(500).json({ 
        message: "Erro ao obter dados de receita por tipo de imóvel",
        error: error.message 
      });
    }
  },

  /**
   * Obtém dados para o gráfico de receita por categoria
   */
  async getReceitaPorCategoria(req, res) {
    try {
      // Obter todos os contratos ativos
      const contratos = await Contrato.find({ status: 'Ativo' });
      
      // Calcular receita total
      const receitaTotal = contratos.reduce((total, contrato) => total + contrato.valorAluguel, 0);
      
      // Simular distribuição por categoria
      const receitaAluguel = Math.round(receitaTotal * 0.68);
      const receitaCondominio = Math.round(receitaTotal * 0.20);
      const receitaIPTU = Math.round(receitaTotal * 0.08);
      const receitaSeguro = Math.round(receitaTotal * 0.04);
      
      const dadosGrafico = [
        { categoria: 'Aluguel', valor: receitaAluguel, percentual: 68 },
        { categoria: 'Condomínio', valor: receitaCondominio, percentual: 20 },
        { categoria: 'IPTU', valor: receitaIPTU, percentual: 8 },
        { categoria: 'Seguro', valor: receitaSeguro, percentual: 4 }
      ];
      
      res.status(200).json(dadosGrafico);
    } catch (error) {
      console.error("Erro ao obter dados de receita por categoria:", error);
      res.status(500).json({ 
        message: "Erro ao obter dados de receita por categoria",
        error: error.message 
      });
    }
  },

  /**
   * Obtém alertas importantes para o dashboard
   */
  async getAlertas(req, res) {
    try {
      const hoje = new Date();
      const trintaDiasDepois = new Date();
      trintaDiasDepois.setDate(hoje.getDate() + 30);
      
      // Contratos vencendo em 30 dias
      const contratosVencendo = await Contrato.countDocuments({
        status: 'Ativo',
        dataFim: { $gte: hoje, $lte: trintaDiasDepois }
      });
      
      // Inquilinos em atraso
      const inquilinosAtraso = await Contrato.countDocuments({
        status: 'Ativo',
        'pagamentos.status': 'Atrasado'
      });
      
      // Imóveis que precisam de vistoria
      const imoveisVistoria = await Imovel.countDocuments({
        proximaVistoria: { $lte: trintaDiasDepois }
      });
      
      // Novos inquilinos cadastrados recentemente
      const dataUmaSemanaAtras = new Date();
      dataUmaSemanaAtras.setDate(hoje.getDate() - 7);
      
      const novosInquilinos = await Inquilino.countDocuments({
        createdAt: { $gte: dataUmaSemanaAtras }
      });
      
      const alertas = [
        contratosVencendo > 0 ? { 
          id: 1, 
          titulo: `${contratosVencendo} contratos vencendo em 30 dias`, 
          tipo: "warning", 
          data: "Hoje", 
          acao: "Verificar renovações",
          prioridade: "Alta"
        } : null,
        inquilinosAtraso > 0 ? { 
          id: 2, 
          titulo: `${inquilinosAtraso} inquilinos em atraso`, 
          tipo: "danger", 
          data: "Hoje", 
          acao: "Enviar cobranças",
          prioridade: "Urgente"
        } : null,
        imoveisVistoria > 0 ? { 
          id: 3, 
          titulo: `${imoveisVistoria} imóveis precisam de vistoria`, 
          tipo: "info", 
          data: "Esta semana", 
          acao: "Agendar vistorias",
          prioridade: "Média"
        } : null,
        novosInquilinos > 0 ? { 
          id: 4, 
          titulo: `${novosInquilinos} novos inquilinos cadastrados`, 
          tipo: "success", 
          data: "Esta semana", 
          acao: "Processar documentos",
          prioridade: "Baixa"
        } : null
      ].filter(alerta => alerta !== null);
      
      res.status(200).json(alertas);
    } catch (error) {
      console.error("Erro ao obter alertas do dashboard:", error);
      res.status(500).json({ 
        message: "Erro ao obter alertas do dashboard",
        error: error.message 
      });
    }
  },

  /**
   * Obtém próximos vencimentos de contratos
   */
  async getProximosVencimentos(req, res) {
    try {
      const hoje = new Date();
      const trintaDiasDepois = new Date();
      trintaDiasDepois.setDate(hoje.getDate() + 30);
      
      // Buscar contratos com vencimento próximo
      const contratos = await Contrato.find({
        status: 'Ativo',
        dataFim: { $gte: hoje, $lte: trintaDiasDepois }
      }).populate('inquilinoId').sort({ dataFim: 1 }).limit(5);
      
      const proximosVencimentos = contratos.map(contrato => ({
        contrato: contrato.codigo,
        inquilino: contrato.inquilinoId ? contrato.inquilinoId.nome : 'Inquilino não encontrado',
        valor: contrato.valorAluguel,
        data: contrato.dataFim.toISOString().split('T')[0]
      }));
      
      res.status(200).json(proximosVencimentos);
    } catch (error) {
      console.error("Erro ao obter próximos vencimentos:", error);
      res.status(500).json({
        message: "Erro ao obter próximos vencimentos",
        error: error.message
      });
    }
  },

  /**
   * Obtém todos os dados para o dashboard completo
   */
  async getDashboardCompleto(req, res) {
    try {
      // Estatísticas gerais
      const totalImoveis = await Imovel.countDocuments({});
      const contratosAtivos = await Contrato.countDocuments({ status: 'Ativo' });
      const imoveisOcupados = await Imovel.countDocuments({ status: 'Ocupado' });
      const taxaOcupacao = totalImoveis > 0 ? Math.round((imoveisOcupados / totalImoveis) * 100) : 0;
      
      // Cálculo da receita mensal
      const contratos = await Contrato.find({ status: 'Ativo' });
      const receitaMensal = contratos.reduce((total, contrato) => total + contrato.valorAluguel, 0);
      
      // Cálculo da inadimplência
      const contratosPagamentosAtrasados = await Contrato.countDocuments({
        status: 'Ativo',
        'pagamentos.status': 'Atrasado'
      });
      
      const taxaInadimplencia = contratosAtivos > 0 
        ? Math.round((contratosPagamentosAtrasados / contratosAtivos) * 100) 
        : 0;
      
      // Dados para gráficos
      // Gráfico de receita mensal
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesAtual = new Date().getMonth();
      const metaBase = 150000;
      const metasPorMes = Array(12).fill(0).map((_, i) => Math.round(metaBase * (1 + (0.02 * i))));
      
      const receitaPorMes = Array(12).fill(0);
      for (let i = 0; i <= mesAtual; i++) {
        const variacao = Math.random() * 0.2 - 0.1; // -10% a +10%
        receitaPorMes[i] = Math.round(metasPorMes[i] * (1 + variacao));
      }
      
      const receitaData = meses.map((mes, index) => ({
        mes,
        valor: receitaPorMes[index],
        meta: metasPorMes[index]
      })).slice(0, mesAtual + 1);
      
      // Gráfico de ocupação
      const ocupados = await Imovel.countDocuments({ status: 'Ocupado' });
      const disponiveis = await Imovel.countDocuments({ status: 'Disponível' });
      const manutencao = await Imovel.countDocuments({ status: 'Manutenção' });
      const reservados = await Imovel.countDocuments({ status: 'Reservado' });
      
      const total = ocupados + disponiveis + manutencao + reservados;
      const calcularPercentual = (valor) => total > 0 ? Math.round((valor / total) * 100) : 0;
      
      const ocupacaoData = [
        { nome: 'Ocupados', valor: calcularPercentual(ocupados), cor: '#10B981' },
        { nome: 'Disponíveis', valor: calcularPercentual(disponiveis), cor: '#F59E0B' },
        { nome: 'Manutenção', valor: calcularPercentual(manutencao), cor: '#EF4444' },
        { nome: 'Reservados', valor: calcularPercentual(reservados), cor: '#8B5CF6' }
      ];
      
      // Receita por tipo de imóvel (simulada)
      const tipoImovelData = [
        { categoria: 'Apartamentos', quantidade: 65, receita: 98000 },
        { categoria: 'Casas', quantidade: 23, receita: 67000 },
        { categoria: 'Comercial', quantidade: 18, receita: 54000 },
        { categoria: 'Sobrados', quantidade: 12, receita: 38000 },
      ];
      
      // Receita por categoria
      const receitaPorCategoria = [
        { categoria: 'Aluguel', valor: Math.round(receitaMensal * 0.68), percentual: 68 },
        { categoria: 'Condomínio', valor: Math.round(receitaMensal * 0.20), percentual: 20 },
        { categoria: 'IPTU', valor: Math.round(receitaMensal * 0.08), percentual: 8 },
        { categoria: 'Seguro', valor: Math.round(receitaMensal * 0.04), percentual: 4 }
      ];
      
      // Alertas
      const hoje = new Date();
      const trintaDiasDepois = new Date();
      trintaDiasDepois.setDate(hoje.getDate() + 30);
      
      const contratosVencendo = await Contrato.countDocuments({
        status: 'Ativo',
        dataFim: { $gte: hoje, $lte: trintaDiasDepois }
      });
      
      const inquilinosAtraso = contratosPagamentosAtrasados;
      
      const imoveisVistoria = await Imovel.countDocuments({
        proximaVistoria: { $lte: trintaDiasDepois }
      });
      
      const dataUmaSemanaAtras = new Date();
      dataUmaSemanaAtras.setDate(hoje.getDate() - 7);
      
      const novosInquilinos = await Inquilino.countDocuments({
        createdAt: { $gte: dataUmaSemanaAtras }
      });
      
      const alertas = [
        contratosVencendo > 0 ? { 
          id: 1, 
          titulo: `${contratosVencendo} contratos vencendo em 30 dias`, 
          tipo: "warning", 
          data: "Hoje", 
          acao: "Verificar renovações",
          prioridade: "Alta"
        } : null,
        inquilinosAtraso > 0 ? { 
          id: 2, 
          titulo: `${inquilinosAtraso} inquilinos em atraso`, 
          tipo: "danger", 
          data: "Hoje", 
          acao: "Enviar cobranças",
          prioridade: "Urgente"
        } : null,
        imoveisVistoria > 0 ? { 
          id: 3, 
          titulo: `${imoveisVistoria} imóveis precisam de vistoria`, 
          tipo: "info", 
          data: "Esta semana", 
          acao: "Agendar vistorias",
          prioridade: "Média"
        } : null,
        novosInquilinos > 0 ? { 
          id: 4, 
          titulo: `${novosInquilinos} novos inquilinos cadastrados`, 
          tipo: "success", 
          data: "Esta semana", 
          acao: "Processar documentos",
          prioridade: "Baixa"
        } : null
      ].filter(alerta => alerta !== null);
      
      // Próximos vencimentos
      const proximosVencimentos = await Contrato.find({
        status: 'Ativo',
        dataFim: { $gte: hoje, $lte: trintaDiasDepois }
      }).populate('inquilinoId').sort({ dataFim: 1 }).limit(5);
      
      const proximosVencimentosFormatados = proximosVencimentos.map(contrato => ({
        contrato: contrato.codigo,
        inquilino: contrato.inquilinoId ? contrato.inquilinoId.nome : 'Inquilino não encontrado',
        valor: contrato.valorAluguel,
        data: contrato.dataFim.toISOString().split('T')[0]
      }));
      
      // Retornar todos os dados
      res.status(200).json({
        estatisticas: {
          totalImoveis,
          contratosAtivos,
          imoveisOcupados,
          taxaOcupacao,
          receitaMensal,
          taxaInadimplencia
        },
        graficos: {
          receitaData,
          ocupacaoData,
          tipoImovelData,
          receitaPorCategoria
        },
        alertas,
        proximosVencimentos: proximosVencimentosFormatados
      });
    } catch (error) {
      console.error('Erro ao obter dados completos do dashboard:', error);
      res.status(500).json({ 
        message: 'Erro ao obter dados completos do dashboard',
        error: error.message 
      });
    }
  }
};

module.exports = dashboardController;

