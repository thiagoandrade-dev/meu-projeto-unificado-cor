
import axios from 'axios';

// URL base da API
// Configuração profissional de URLs
const API_URL = (() => {
  // 1. Variável de ambiente tem prioridade máxima
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // 2. Se estiver em produção (build final)
  if (import.meta.env.PROD) return 'https://meu-backend-2eb1.onrender.com';
  
  // 3. Default para desenvolvimento
  return 'http://localhost:5000';
})();

// Criando instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Contrato {
  _id?: string;
  numero: string;
  inquilino: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    rg: string;
  };
  imovel: {
    id: string;
    endereco: string;
    bairro: string;
    cidade: string;
  };
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
  // Listar todos os contratos
  getAll: async (): Promise<Contrato[]> => {
    try {
      const response = await api.get('/api/contratos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar contratos:', error);
      throw error;
    }
  },

  // Buscar contrato por ID
  getById: async (id: string): Promise<Contrato> => {
    try {
      const response = await api.get(`/api/contratos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar contrato ${id}:`, error);
      throw error;
    }
  },

  // Criar novo contrato
  create: async (contratoData: Omit<Contrato, '_id' | 'dataCriacao'>): Promise<Contrato> => {
    try {
      const response = await api.post('/api/contratos', contratoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  },

  // Atualizar contrato
  update: async (id: string, contratoData: Partial<Contrato>): Promise<Contrato> => {
    try {
      const response = await api.put(`/api/contratos/${id}`, contratoData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar contrato ${id}:`, error);
      throw error;
    }
  },

  // Deletar contrato
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/contratos/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar contrato ${id}:`, error);
      throw error;
    }
  },

  // Gerar pagamentos mensais para um contrato
  gerarPagamentos: async (contratoId: string, meses: number): Promise<PagamentoContrato[]> => {
    try {
      const response = await api.post(`/api/contratos/${contratoId}/gerar-pagamentos`, { meses });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar pagamentos:', error);
      throw error;
    }
  },

  // Listar pagamentos de um contrato
  getPagamentos: async (contratoId: string): Promise<PagamentoContrato[]> => {
    try {
      const response = await api.get(`/api/contratos/${contratoId}/pagamentos`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      throw error;
    }
  },

  // Marcar pagamento como pago
  marcarPago: async (pagamentoId: string, dataPagamento: string): Promise<PagamentoContrato> => {
    try {
      const response = await api.patch(`/api/pagamentos/${pagamentoId}/pagar`, { dataPagamento });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar pagamento como pago:', error);
      throw error;
    }
  },

  // Enviar cobrança por email
  enviarCobranca: async (contratoId: string, pagamentoId: string): Promise<void> => {
    try {
      await api.post(`/api/contratos/${contratoId}/enviar-cobranca`, { pagamentoId });
    } catch (error) {
      console.error('Erro ao enviar cobrança:', error);
      throw error;
    }
  }
};

export default contratoService;
