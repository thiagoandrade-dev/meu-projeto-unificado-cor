import { api, handleApiError, Usuario, Imovel } from "./apiService";

export interface Contrato {
  _id?: string;
  numero: string;
  inquilino: Usuario & { cpf: string; rg: string };
  imovel: Pick<Imovel, "titulo" | "endereco" | "cidade"> & { _id: string };
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  valorCondominio?: number;
  valorIPTU?: number;
  diaVencimento: number;
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
};


export default contratoService;

