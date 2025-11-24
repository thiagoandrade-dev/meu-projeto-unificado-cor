const Imovel = require('../models/Imovel');
const Contrato = require('../models/Contrato');
const Inquilino = require('../models/Inquilino');
const Juridico = require('../models/Juridico');
const { sendEmail, emailTemplates } = require('../config/emailConfig');

// Função para calcular período baseado no tipo
const calcularPeriodo = (tipoPeriodo, dataInicio, dataFim) => {
  const hoje = new Date();
  let inicio, fim;

  switch (tipoPeriodo) {
    case 'current-month':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      break;
    case 'last-month':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      break;
    case 'current-quarter':
      const quarterStart = Math.floor(hoje.getMonth() / 3) * 3;
      inicio = new Date(hoje.getFullYear(), quarterStart, 1);
      fim = new Date(hoje.getFullYear(), quarterStart + 3, 0);
      break;
    case 'last-quarter':
      const lastQuarterStart = Math.floor(hoje.getMonth() / 3) * 3 - 3;
      inicio = new Date(hoje.getFullYear(), lastQuarterStart, 1);
      fim = new Date(hoje.getFullYear(), lastQuarterStart + 3, 0);
      break;
    case 'current-year':
      inicio = new Date(hoje.getFullYear(), 0, 1);
      fim = new Date(hoje.getFullYear(), 11, 31);
      break;
    case 'last-year':
      inicio = new Date(hoje.getFullYear() - 1, 0, 1);
      fim = new Date(hoje.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      inicio = new Date(dataInicio);
      fim = new Date(dataFim);
      break;
    default:
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  }

  return { inicio, fim };
};

// Gerar relatório financeiro
const gerarRelatorioFinanceiro = async (req, res) => {
  try {
    const { periodo, dataInicio, dataFim } = req.body;
    const { inicio, fim } = calcularPeriodo(periodo, dataInicio, dataFim);

    // Buscar contratos no período
    const contratos = await Contrato.find({
      dataInicio: { $lte: fim },
      $or: [
        { dataFim: { $gte: inicio } },
        { dataFim: null }
      ]
    }).populate('imovel').populate('inquilino');

    // Calcular métricas financeiras
    let receitaTotal = 0;
    let receitaRecebida = 0;
    let inadimplencia = 0;
    let contratosAtivos = 0;

    contratos.forEach(contrato => {
      if ((contrato.status || '').toLowerCase() === 'ativo') {
        contratosAtivos++;
        receitaTotal += contrato.valorAluguel || 0;
        
        // Simular pagamentos (em um sistema real, isso viria de uma tabela de pagamentos)
        if (Math.random() > 0.1) { // 90% de pagamentos em dia
          receitaRecebida += contrato.valorAluguel || 0;
        } else {
          inadimplencia += contrato.valorAluguel || 0;
        }
      }
    });

    const taxaInadimplencia = receitaTotal > 0 ? (inadimplencia / receitaTotal) * 100 : 0;

    const relatorio = {
      tipo: 'financeiro',
      periodo: { inicio, fim },
      geradoEm: new Date(),
      dados: {
        receitaTotal,
        receitaRecebida,
        inadimplencia,
        taxaInadimplencia: taxaInadimplencia.toFixed(2),
        contratosAtivos,
        contratos: contratos.map(c => ({
          id: c._id,
          inquilino: c.inquilino?.nome,
          imovel: c.imovel?.endereco,
          valorAluguel: c.valorAluguel,
          status: c.status
        }))
      }
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório financeiro' });
  }
};

// Gerar relatório de imóveis
const gerarRelatorioImoveis = async (req, res) => {
  try {
    const { periodo, dataInicio, dataFim } = req.body;
    const { inicio, fim } = calcularPeriodo(periodo, dataInicio, dataFim);

    const imoveis = await Imovel.find({});
    const contratos = await Contrato.find({
      dataInicio: { $lte: fim },
      $or: [
        { dataFim: { $gte: inicio } },
        { dataFim: null }
      ]
    }).populate('imovel');

    // Calcular ocupação
    const totalImoveis = imoveis.length;
    const imoveisOcupados = contratos.filter(c => (c.status || '').toLowerCase() === 'ativo').length;
    const taxaOcupacao = totalImoveis > 0 ? (imoveisOcupados / totalImoveis) * 100 : 0;

    // Agrupar por tipo
    const porTipo = {};
    imoveis.forEach(imovel => {
      const tipo = imovel.tipo || 'Não especificado';
      if (!porTipo[tipo]) {
        porTipo[tipo] = { total: 0, ocupados: 0 };
      }
      porTipo[tipo].total++;
      
      const contratoAtivo = contratos.find(c => 
        c.imovel._id.toString() === imovel._id.toString() && (c.status || '').toLowerCase() === 'ativo'
      );
      if (contratoAtivo) {
        porTipo[tipo].ocupados++;
      }
    });

    const relatorio = {
      tipo: 'imoveis',
      periodo: { inicio, fim },
      geradoEm: new Date(),
      dados: {
        totalImoveis,
        imoveisOcupados,
        imoveisDisponiveis: totalImoveis - imoveisOcupados,
        taxaOcupacao: taxaOcupacao.toFixed(2),
        porTipo,
        imoveis: imoveis.map(i => ({
          id: i._id,
          endereco: i.endereco,
          tipo: i.tipo,
          valorAluguel: i.valorAluguel,
          status: contratos.find(c => 
            c.imovel._id.toString() === i._id.toString() && c.status === 'ativo'
          ) ? 'Ocupado' : 'Disponível'
        }))
      }
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de imóveis:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de imóveis' });
  }
};

// Gerar relatório de contratos
const gerarRelatorioContratos = async (req, res) => {
  try {
    const { periodo, dataInicio, dataFim } = req.body;
    const { inicio, fim } = calcularPeriodo(periodo, dataInicio, dataFim);

    const contratos = await Contrato.find({
      $or: [
        { dataInicio: { $gte: inicio, $lte: fim } },
        { dataFim: { $gte: inicio, $lte: fim } },
        { dataInicio: { $lte: inicio }, dataFim: { $gte: fim } }
      ]
    }).populate('imovel').populate('inquilino');

    // Agrupar por status
    const porStatus = {};
    contratos.forEach(contrato => {
      const status = contrato.status || 'Não especificado';
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    // Contratos vencendo em 30 dias
    const em30Dias = new Date();
    em30Dias.setDate(em30Dias.getDate() + 30);
    
    const contratosVencendo = contratos.filter(c => 
      c.dataFim && new Date(c.dataFim) <= em30Dias && (c.status || '').toLowerCase() === 'ativo'
    );

    const relatorio = {
      tipo: 'contratos',
      periodo: { inicio, fim },
      geradoEm: new Date(),
      dados: {
        totalContratos: contratos.length,
        porStatus,
        contratosVencendo: contratosVencendo.length,
        contratos: contratos.map(c => ({
          id: c._id,
          inquilino: c.inquilino?.nome,
          imovel: c.imovel?.endereco,
          dataInicio: c.dataInicio,
          dataFim: c.dataFim,
          valorAluguel: c.valorAluguel,
          status: c.status
        })),
        vencendo: contratosVencendo.map(c => ({
          id: c._id,
          inquilino: c.inquilino?.nome,
          imovel: c.imovel?.endereco,
          dataFim: c.dataFim
        }))
      }
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de contratos:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de contratos' });
  }
};

// Gerar relatório de inquilinos
const gerarRelatorioInquilinos = async (req, res) => {
  try {
    const { periodo, dataInicio, dataFim } = req.body;
    const { inicio, fim } = calcularPeriodo(periodo, dataInicio, dataFim);

    const inquilinos = await Inquilino.find({});
    const contratos = await Contrato.find({
      dataInicio: { $lte: fim },
      $or: [
        { dataFim: { $gte: inicio } },
        { dataFim: null }
      ]
    }).populate('inquilino').populate('imovel');

    // Inquilinos ativos
    const inquilinosAtivos = contratos.filter(c => (c.status || '').toLowerCase() === 'ativo').map(c => c.inquilino);
    
    const relatorio = {
      tipo: 'inquilinos',
      periodo: { inicio, fim },
      geradoEm: new Date(),
      dados: {
        totalInquilinos: inquilinos.length,
        inquilinosAtivos: inquilinosAtivos.length,
        inquilinos: inquilinos.map(i => {
          const contratoAtivo = contratos.find(c => 
            c.inquilino._id.toString() === i._id.toString() && (c.status || '').toLowerCase() === 'ativo'
          );
          return {
            id: i._id,
            nome: i.nome,
            email: i.email,
            telefone: i.telefone,
            status: contratoAtivo ? 'Ativo' : 'Inativo',
            imovel: contratoAtivo?.imovel?.endereco || 'N/A'
          };
        })
      }
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de inquilinos:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de inquilinos' });
  }
};

// Gerar relatório jurídico
const gerarRelatorioJuridico = async (req, res) => {
  try {
    const { periodo, dataInicio, dataFim } = req.body;
    const { inicio, fim } = calcularPeriodo(periodo, dataInicio, dataFim);

    const processosJuridicos = await Juridico.find({
      dataAbertura: { $gte: inicio, $lte: fim }
    });

    // Agrupar por tipo e status
    const porTipo = {};
    const porStatus = {};

    processosJuridicos.forEach(processo => {
      const tipo = processo.tipo || 'Não especificado';
      const status = processo.status || 'Não especificado';
      
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    const relatorio = {
      tipo: 'juridico',
      periodo: { inicio, fim },
      geradoEm: new Date(),
      dados: {
        totalProcessos: processosJuridicos.length,
        porTipo,
        porStatus,
        processos: processosJuridicos.map(p => ({
          id: p._id,
          titulo: p.titulo,
          tipo: p.tipo,
          status: p.status,
          dataAbertura: p.dataAbertura,
          prioridade: p.prioridade,
          valorCausa: p.valorCausa
        }))
      }
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório jurídico:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório jurídico' });
  }
};

// Enviar relatório por email
const enviarRelatorioPorEmail = async (req, res) => {
  try {
    const { relatorio, email, assunto } = req.body;

    if (!email || !relatorio) {
      return res.status(400).json({ erro: 'Email e relatório são obrigatórios' });
    }

    // Gerar HTML do relatório
    const htmlRelatorio = gerarHTMLRelatorio(relatorio);

    const emailData = {
      to: email,
      subject: assunto || `Relatório ${relatorio.tipo} - ${new Date().toLocaleDateString()}`,
      html: htmlRelatorio
    };

    await sendEmail(emailData);

    res.json({ 
      sucesso: true, 
      mensagem: 'Relatório enviado por email com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao enviar relatório por email:', error);
    res.status(500).json({ erro: 'Erro ao enviar relatório por email' });
  }
};

// Função auxiliar para gerar HTML do relatório
const gerarHTMLRelatorio = (relatorio) => {
  const { tipo, periodo, geradoEm, dados } = relatorio;
  
  let conteudo = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .metric { display: inline-block; margin: 10px; padding: 15px; background-color: #e9ecef; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h1>
          <p><strong>Período:</strong> ${new Date(periodo.inicio).toLocaleDateString()} a ${new Date(periodo.fim).toLocaleDateString()}</p>
          <p><strong>Gerado em:</strong> ${new Date(geradoEm).toLocaleString()}</p>
        </div>
  `;

  // Adicionar métricas específicas por tipo
  switch (tipo) {
    case 'financeiro':
      conteudo += `
        <div class="section">
          <h2>Resumo Financeiro</h2>
          <div class="metric">
            <strong>Receita Total:</strong><br>
            R$ ${dados.receitaTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
          <div class="metric">
            <strong>Receita Recebida:</strong><br>
            R$ ${dados.receitaRecebida?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
          <div class="metric">
            <strong>Inadimplência:</strong><br>
            R$ ${dados.inadimplencia?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </div>
          <div class="metric">
            <strong>Taxa de Inadimplência:</strong><br>
            ${dados.taxaInadimplencia || '0'}%
          </div>
        </div>
      `;
      break;
    
    case 'imoveis':
      conteudo += `
        <div class="section">
          <h2>Resumo de Imóveis</h2>
          <div class="metric">
            <strong>Total de Imóveis:</strong><br>
            ${dados.totalImoveis || 0}
          </div>
          <div class="metric">
            <strong>Imóveis Ocupados:</strong><br>
            ${dados.imoveisOcupados || 0}
          </div>
          <div class="metric">
            <strong>Taxa de Ocupação:</strong><br>
            ${dados.taxaOcupacao || '0'}%
          </div>
        </div>
      `;
      break;
  }

  conteudo += `
      </body>
    </html>
  `;

  return conteudo;
};

module.exports = {
  gerarRelatorioFinanceiro,
  gerarRelatorioImoveis,
  gerarRelatorioContratos,
  gerarRelatorioInquilinos,
  gerarRelatorioJuridico,
  enviarRelatorioPorEmail
};