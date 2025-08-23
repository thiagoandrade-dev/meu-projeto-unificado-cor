import { api, handleApiError, Imovel } from "./apiService";

// Interfaces específicas para o imovelService
export interface HistoricoImovel {
  _id: string;
  imovelId: string;
  acao: string;
  dataAcao: string;
  usuario: string;
  detalhes: {
    statusAnterior?: string;
    statusNovo?: string;
    valorVenda?: number;
    nomeComprador?: string;
    cpfComprador?: string;
    motivo?: string;
    observacoes?: string;
  };
}

export interface EstatisticasVendas {
  totalVendas: number;
  valorTotalVendas: number;
  valorMedioVenda: number;
}

export interface ListaImoveisVendidos {
  imoveis: Imovel[];
  total: number;
  pagina: number;
  totalPaginas: number;
  estatisticas: EstatisticasVendas;
}

export const imovelService = {
  getAll: async (): Promise<Imovel[]> => {
    try {
      const response = await api.get<Imovel[]>("/imoveis");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "listar imóveis");
    }
  },

  getById: async (id: string): Promise<Imovel> => {
    try {
      const response = await api.get<Imovel>(`/imoveis/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `buscar imóvel ${id}`);
    }
  },

  create: async (imovel: Omit<Imovel, "_id">): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>("/imoveis", imovel);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "criar imóvel");
    }
  },

  update: async (id: string, imovel: Partial<Imovel>): Promise<Imovel> => {
    try {
      const response = await api.put<Imovel>(`/imoveis/${id}`, imovel);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `atualizar imóvel ${id}`);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/imoveis/${id}`);
    } catch (error) {
      throw handleApiError(error, `deletar imóvel ${id}`);
    }
  },

  finalizarVenda: async (id: string, dadosVenda: {
    nomeComprador: string;
    cpfComprador: string;
    emailComprador?: string;
    telefoneComprador?: string;
    valorVenda: number;
    observacoes?: string;
  }): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>(`/imoveis/${id}/finalizar-venda`, dadosVenda);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `finalizar venda do imóvel ${id}`);
    }
  },

  reverterVenda: async (id: string, dados: {
    motivo: string;
    novoStatus: string;
    observacoes?: string;
  }): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>(`/imoveis/${id}/reverter-venda`, dados);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `reverter venda do imóvel ${id}`);
    }
  },

  obterHistorico: async (id: string): Promise<HistoricoImovel[]> => {
    try {
      const response = await api.get<HistoricoImovel[]>(`/imoveis/${id}/historico`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `obter histórico do imóvel ${id}`);
    }
  },

  listarImoveisVendidos: async (filtros?: {
    busca?: string;
    dataInicio?: string;
    dataFim?: string;
    valorMinimo?: number;
    valorMaximo?: number;
    pagina?: number;
    limite?: number;
  }): Promise<ListaImoveisVendidos> => {
    try {
      const params = new URLSearchParams();
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      const response = await api.get<ListaImoveisVendidos>(`/imoveis/vendidos/listar?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'listar imóveis vendidos');
    }
  },
};
