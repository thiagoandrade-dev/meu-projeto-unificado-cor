// frontend/src/services/dashboardService.ts
import { api } from "./apiService";

export interface DashboardEstatisticas {
  totalImoveis: number;
  contratosAtivos: number;
  taxaOcupacao: number;
  receitaMensal: number;
  taxaInadimplencia: number;
}

export interface ReceitaMensalItem {
  mes: string;
  valor: number;
  meta: number;
}

export interface OcupacaoItem {
  nome: string;
  valor: number;
  cor: string;
}

export interface TipoImovelItem {
  categoria: string;
  quantidade: number;
  receita: number;
}

export interface ReceitaCategoriaItem {
  categoria: string;
  valor: number;
  percentual: number;
}

export interface Alerta {
  id: number;
  titulo: string;
  tipo: 'success' | 'warning' | 'danger' | 'info';
  data: string;
  acao: string;
  prioridade: 'Urgente' | 'Alta' | 'Média' | 'Baixa';
}

export interface ProximoVencimento {
  contrato: string;
  inquilino: string;
  valor: number;
  data: string;
}

export interface DashboardCompleto {
  estatisticas: DashboardEstatisticas;
  graficos: {
    receitaData: ReceitaMensalItem[];
    ocupacaoData: OcupacaoItem[];
    tipoImovelData: TipoImovelItem[];
    receitaPorCategoria: ReceitaCategoriaItem[];
  };
  alertas: Alerta[];
  proximosVencimentos: ProximoVencimento[];
}

const dashboardService = {
  /**
   * Obtém todos os dados do dashboard em uma única chamada
   */
  async getDashboardCompleto(): Promise<DashboardCompleto> {
    try {
      const response = await api.get<DashboardCompleto>('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtém apenas as estatísticas gerais
   */
  async getEstatisticas(): Promise<DashboardEstatisticas> {
    try {
      const response = await apiClient.get<DashboardEstatisticas>('/dashboard/estatisticas');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtém dados de receita mensal
   */
  async getReceitaMensal(): Promise<ReceitaMensalItem[]> {
    try {
      const response = await apiClient.get<ReceitaMensalItem[]>('/dashboard/receita-mensal');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados de receita mensal:', error);
      throw error;
    }
  },

  /**
   * Obtém dados de ocupação
   */
  async getOcupacao(): Promise<OcupacaoItem[]> {
    try {
      const response = await apiClient.get<OcupacaoItem[]>('/dashboard/ocupacao');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados de ocupação:', error);
      throw error;
    }
  },

  /**
   * Obtém dados de receita por tipo de imóvel
   */
  async getReceitaPorTipoImovel(): Promise<TipoImovelItem[]> {
    try {
      const response = await apiClient.get<TipoImovelItem[]>('/dashboard/receita-por-tipo');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados de receita por tipo de imóvel:', error);
      throw error;
    }
  },

  /**
   * Obtém dados de receita por categoria
   */
  async getReceitaPorCategoria(): Promise<ReceitaCategoriaItem[]> {
    try {
      const response = await apiClient.get<ReceitaCategoriaItem[]>('/dashboard/receita-por-categoria');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados de receita por categoria:', error);
      throw error;
    }
  },

  /**
   * Obtém alertas importantes
   */
  async getAlertas(): Promise<Alerta[]> {
    try {
      const response = await apiClient.get<Alerta[]>('/dashboard/alertas');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter alertas:', error);
      throw error;
    }
  },

  /**
   * Obtém próximos vencimentos
   */
  async getProximosVencimentos(): Promise<ProximoVencimento[]> {
    try {
      const response = await apiClient.get<ProximoVencimento[]>('/dashboard/proximos-vencimentos');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter próximos vencimentos:', error);
      throw error;
    }
  }
};

export default dashboardService;

