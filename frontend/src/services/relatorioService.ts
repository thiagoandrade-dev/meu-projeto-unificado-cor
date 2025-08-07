import { api } from './apiService';
import { escapeCsvValue, downloadCsv } from '../utils/csvUtils';

export interface RelatorioRequest {
  periodo: string;
  dataInicio?: string;
  dataFim?: string;
}

interface ContratoRelatorio {
  id: string;
  inquilino: string;
  imovel: string;
  valorAluguel: number;
  status: string;
}

interface ImovelRelatorio {
  id: string;
  endereco: string;
  tipo: string;
  valorAluguel: number;
  status: string;
}

interface DadosRelatorio {
  contratos?: ContratoRelatorio[];
  imoveis?: ImovelRelatorio[];
  [key: string]: unknown;
}

export interface RelatorioResponse {
  tipo: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  geradoEm: string;
  dados: DadosRelatorio | Record<string, unknown>[] | Record<string, unknown>;
}

export interface EmailRequest {
  relatorio: RelatorioResponse;
  email: string;
  assunto?: string;
}

export const relatorioService = {
  // Gerar relatório financeiro
  async gerarFinanceiro(request: RelatorioRequest): Promise<RelatorioResponse> {
    try {
      const response = await api.post('/relatorios/financeiro', request);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      throw error;
    }
  },

  // Gerar relatório de imóveis
  async gerarImoveis(request: RelatorioRequest): Promise<RelatorioResponse> {
    try {
      const response = await api.post('/relatorios/imoveis', request);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de imóveis:', error);
      throw error;
    }
  },

  // Gerar relatório de contratos
  async gerarContratos(request: RelatorioRequest): Promise<RelatorioResponse> {
    try {
      const response = await api.post('/relatorios/contratos', request);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de contratos:', error);
      throw error;
    }
  },

  // Gerar relatório de inquilinos
  async gerarInquilinos(request: RelatorioRequest): Promise<RelatorioResponse> {
    try {
      const response = await api.post('/relatorios/inquilinos', request);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de inquilinos:', error);
      throw error;
    }
  },

  // Gerar relatório jurídico
  async gerarJuridico(request: RelatorioRequest): Promise<RelatorioResponse> {
    try {
      const response = await api.post('/relatorios/juridico', request);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório jurídico:', error);
      throw error;
    }
  },

  // Enviar relatório por email
  async enviarPorEmail(request: EmailRequest): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      const response = await api.post('/relatorios/enviar-email', request);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar relatório por email:', error);
      throw error;
    }
  },

  // Gerar relatório baseado no tipo
  async gerarRelatorio(tipo: string, request: RelatorioRequest): Promise<RelatorioResponse> {
    switch (tipo) {
      case 'financeiro':
        return this.gerarFinanceiro(request);
      case 'imoveis':
        return this.gerarImoveis(request);
      case 'contratos':
        return this.gerarContratos(request);
      case 'inquilinos':
        return this.gerarInquilinos(request);
      case 'juridico':
        return this.gerarJuridico(request);
      default:
        throw new Error(`Tipo de relatório não suportado: ${tipo}`);
    }
  },

  // Baixar relatório como JSON
  downloadJSON(relatorio: RelatorioResponse, filename?: string) {
    const dataStr = JSON.stringify(relatorio, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename || `relatorio_${relatorio.tipo}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  // Baixar relatório como CSV (para dados tabulares)
  downloadCSV(relatorio: RelatorioResponse, filename?: string) {
    const separator = ';';
    let csvContent = '';
    
    // Cabeçalho do relatório
    csvContent += `${escapeCsvValue(`Relatório ${relatorio.tipo}`)}\r\n`;
    csvContent += `${escapeCsvValue(`Período: ${new Date(relatorio.periodo.inicio).toLocaleDateString()} a ${new Date(relatorio.periodo.fim).toLocaleDateString()}`)}\r\n`;
    csvContent += `${escapeCsvValue(`Gerado em: ${new Date(relatorio.geradoEm).toLocaleString()}`)}\r\n\r\n`;
    
    // Dados específicos por tipo
    if (relatorio.tipo === 'financeiro' && typeof relatorio.dados === 'object' && relatorio.dados !== null && 'contratos' in relatorio.dados && Array.isArray(relatorio.dados.contratos)) {
      const headers = ['ID', 'Inquilino', 'Imóvel', 'Valor Aluguel', 'Status'];
      csvContent += headers.map(header => escapeCsvValue(header)).join(separator) + '\r\n';
      
      relatorio.dados.contratos.forEach((contrato: ContratoRelatorio) => {
        const row = [
          escapeCsvValue(contrato.id),
          escapeCsvValue(contrato.inquilino || 'N/A'),
          escapeCsvValue(contrato.imovel || 'N/A'),
          escapeCsvValue(contrato.valorAluguel || 0),
          escapeCsvValue(contrato.status)
        ];
        csvContent += row.join(separator) + '\r\n';
      });
    } else if (relatorio.tipo === 'imoveis' && typeof relatorio.dados === 'object' && relatorio.dados !== null && 'imoveis' in relatorio.dados && Array.isArray(relatorio.dados.imoveis)) {
      const headers = ['ID', 'Endereço', 'Tipo', 'Valor Aluguel', 'Status'];
      csvContent += headers.map(header => escapeCsvValue(header)).join(separator) + '\r\n';
      
      relatorio.dados.imoveis.forEach((imovel: ImovelRelatorio) => {
        const row = [
          escapeCsvValue(imovel.id),
          escapeCsvValue(imovel.endereco || 'N/A'),
          escapeCsvValue(imovel.tipo || 'N/A'),
          escapeCsvValue(imovel.valorAluguel || 0),
          escapeCsvValue(imovel.status)
        ];
        csvContent += row.join(separator) + '\r\n';
      });
    }
    
    const exportFileDefaultName = filename || `relatorio_${relatorio.tipo}_${new Date().toISOString().split('T')[0]}`;
    downloadCsv(csvContent, exportFileDefaultName);
  }
};