import { api, handleApiError, Inquilino, Imovel } from "./apiService";

export interface Contrato {
  _id?: string;
  numero: string;
  inquilino: Inquilino & { cpf: string; rg: string };
  imovel: Pick<Imovel, "grupo" | "bloco" | "apartamento"> & { _id: string };
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  valorCondominio?: number;
  valorIPTU?: number;
  diaVencimento: number;
  proximoVencimento?: string;
  dataUltimoReajuste?: string;
  percentualReajusteAnual?: number;
  indiceReajuste?: string;
  arquivoContrato?: string;
  status: "Ativo" | "Finalizado" | "Cancelado" | "Pendente";
  observacoes?: string;
  documentos?: string[];
  dataCriacao?: string;
}

export interface PagamentoContrato {
  _id?: string;
  contratoId: string;
  mes: string;
  ano: number;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: "Pendente" | "Pago" | "Atrasado" | "Cancelado";
  multa?: number;
  juros?: number;
  observacoes?: string;
}

export const contratoService = {
  getAll: async (): Promise<Contrato[]> => {
    try {
      const response = await api.get<Contrato[]>("/contratos");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "listar contratos");
    }
  },

  getById: async (id: string): Promise<Contrato> => {
    try {
      const response = await api.get<Contrato>(`/contratos/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `buscar contrato ${id}`);
    }
  },

  create: async (contratoData: Omit<Contrato, "_id" | "dataCriacao">): Promise<Contrato> => {
    try {
      const response = await api.post<Contrato>("/contratos", contratoData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "criar contrato");
    }
  },

  update: async (id: string, contratoData: Partial<Contrato>): Promise<Contrato> => {
    try {
      const response = await api.put<Contrato>(`/contratos/${id}`, contratoData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `atualizar contrato ${id}`);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/contratos/${id}`);
    } catch (error) {
      throw handleApiError(error, `deletar contrato ${id}`);
    }
  },

  gerarPagamentos: async (contratoId: string, meses: number): Promise<PagamentoContrato[]> => {
    try {
      const response = await api.post<PagamentoContrato[]>(`/contratos/${contratoId}/gerar-pagamentos`, { meses });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "gerar pagamentos");
    }
  },

  getPagamentos: async (contratoId: string): Promise<PagamentoContrato[]> => {
    try {
      const response = await api.get<PagamentoContrato[]>(`/contratos/${contratoId}/pagamentos`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "listar pagamentos");
    }
  },

  marcarPago: async (pagamentoId: string, dataPagamento: string): Promise<PagamentoContrato> => {
    try {
      const response = await api.patch<PagamentoContrato>(`/pagamentos/${pagamentoId}/pagar`, { dataPagamento });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "marcar pagamento como pago");
    }
  },

  enviarCobranca: async (contratoId: string, pagamentoId: string): Promise<void> => {
    try {
      await api.post(`/contratos/${contratoId}/enviar-cobranca`, { pagamentoId });
    } catch (error) {
      throw handleApiError(error, "enviar cobrança");
    }
  },

  createWithFile: async (formData: FormData): Promise<Contrato> => {
    try {
      const response = await api.post<Contrato>("/contratos", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "criar contrato com arquivo");
    }
  },

  updateWithFile: async (id: string, formData: FormData): Promise<Contrato> => {
    try {
      const response = await api.put<Contrato>(`/contratos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `atualizar contrato ${id} com arquivo`);
    }
  },

  downloadContrato: async (contratoId: string): Promise<void> => {
    try {
      const response = await api.get(`/contratos/${contratoId}/download`, {
        responseType: 'blob',
      });
      
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Tentar extrair o nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = `contrato-${contratoId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw handleApiError(error, "baixar contrato");
    }
  },
};


export default contratoService;

