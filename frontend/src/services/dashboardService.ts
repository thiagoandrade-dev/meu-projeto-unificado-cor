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
      const [estatisticas, receitaMensal, ocupacao, tipoImovel, categoria, alertas, vencimentos] = await Promise.all([
        this.getEstatisticas(),
        this.getReceitaMensal(),
        this.getOcupacao(),
        this.getReceitaPorTipoImovel(),
        this.getReceitaPorCategoria(),
        this.getAlertas(),
        this.getProximosVencimentos()
      ]);

      return {
        estatisticas,
        graficos: {
          receitaData: receitaMensal,
          ocupacaoData: ocupacao,
          tipoImovelData: tipoImovel,
          receitaPorCategoria: categoria
        },
        alertas,
        proximosVencimentos: vencimentos
      };
    } catch (error) {
      console.error('Erro ao carregar dados completos do dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtém apenas as estatísticas gerais
   */
  async getEstatisticas(): Promise<DashboardEstatisticas> {
    try {
      const response = await api.get<DashboardEstatisticas>('/dashboard/estatisticas');
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
      const response = await api.get<ReceitaMensalItem[]>('/dashboard/receita-mensal');
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
      const response = await api.get<OcupacaoItem[]>('/dashboard/ocupacao');
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
      const response = await api.get<TipoImovelItem[]>('/dashboard/receita-por-tipo');
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
      const response = await api.get<ReceitaCategoriaItem[]>('/dashboard/receita-por-categoria');
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
      const response = await api.get<Alerta[]>('/dashboard/alertas');
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
      const response = await api.get<ProximoVencimento[]>('/dashboard/proximos-vencimentos');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter próximos vencimentos:', error);
      throw error;
    }
  }
};

export default dashboardService;

