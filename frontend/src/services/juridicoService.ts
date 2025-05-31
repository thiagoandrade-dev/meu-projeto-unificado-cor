import axios, { 
  AxiosError, 
  AxiosResponse, 
  InternalAxiosRequestConfig,
  AxiosRequestConfig
} from 'axios';

// Configuração robusta de URL base
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.PROD 
    ? 'https://meu-backend-2eb1.onrender.com' 
    : 'http://localhost:5000';
};

const API_URL = getApiBaseUrl();

// Configuração centralizada do Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para autenticação
const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Interceptor de resposta para tratamento de erros
const responseInterceptor = {
  success: (response: AxiosResponse) => response,
  error: (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
};

api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor.success, responseInterceptor.error);

// Tipos de Documentos Jurídicos
export type DocumentoTipo = "Contrato" | "Adendo" | "Notificação" | "Procuração" | "Distrato" | "Vistoria" | "Outros";
export type DocumentoStatus = "Ativo" | "Arquivado" | "Pendente";

export interface DocumentoJuridico {
  _id?: string;
  titulo: string;
  tipo: DocumentoTipo;
  descricao?: string;
  arquivo: string;
  tamanho: string;
  formato: string;
  autor: string;
  contratoRelacionado?: string;
  imovelRelacionado?: string;
  status: DocumentoStatus;
  dataCriacao: string;
  dataModificacao?: string;
  tags?: string[];
  observacoes?: string;
}

// Tipos de Processos Jurídicos
export type ProcessoTipo = "Despejo" | "Cobrança" | "Danos" | "Distrato" | "Renovação" | "Outros";
export type ProcessoStatus = "Aberto" | "Em Andamento" | "Concluído" | "Arquivado";
export type ProcessoPrioridade = "Baixa" | "Média" | "Alta" | "Urgente";

export interface ProcessoJuridico {
  _id?: string;
  numero: string;
  tipo: ProcessoTipo;
  contratoId: string;
  status: ProcessoStatus;
  prioridade: ProcessoPrioridade;
  descricao: string;
  advogadoResponsavel: string;
  dataAbertura: string;
  dataPrazo?: string;
  documentos: string[];
  observacoes?: string;
  valor?: number;
}

interface NotificacaoPayload {
  tipo: string;
  destinatario: string;
  dados: Record<string, unknown>;
  remetente: string;
}

// Tratamento centralizado de erros
function handleApiError(error: unknown, defaultMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    const errorMessage = serverMessage || defaultMessage;
    console.error(`${errorMessage}:`, error.response?.data || error.message);
    return new Error(errorMessage);
  }
  console.error(defaultMessage, error);
  return error instanceof Error ? error : new Error(defaultMessage);
}

// Serviço Jurídico com tipagem forte
export const juridicoService = {
  documentos: {
    listar: async (): Promise<DocumentoJuridico[]> => {
      try {
        const { data } = await api.get<DocumentoJuridico[]>('/api/juridico/documentos');
        return data;
      } catch (error) {
        throw handleApiError(error, 'Erro ao listar documentos');
      }
    },

    criar: async (formData: FormData): Promise<DocumentoJuridico> => {
      try {
        const { data } = await api.post<DocumentoJuridico>(
          '/api/juridico/documentos', 
          formData, 
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        return data;
      } catch (error) {
        throw handleApiError(error, 'Erro ao criar documento');
      }
    },

    atualizar: async (id: string, documento: Partial<DocumentoJuridico>): Promise<DocumentoJuridico> => {
      try {
        const { data } = await api.put<DocumentoJuridico>(
          `/api/juridico/documentos/${id}`, 
          documento
        );
        return data;
      } catch (error) {
        throw handleApiError(error, 'Erro ao atualizar documento');
      }
    },

    remover: async (id: string): Promise<void> => {
      try {
        await api.delete(`/api/juridico/documentos/${id}`);
      } catch (error) {
        throw handleApiError(error, 'Erro ao remover documento');
      }
    }
  },

  processos: {
    listar: async (): Promise<ProcessoJuridico[]> => {
      try {
        const { data } = await api.get<ProcessoJuridico[]>('/api/juridico/processos');
        return data;
      } catch (error) {
        throw handleApiError(error, 'Erro ao listar processos');
      }
    },

    criar: async (processo: Omit<ProcessoJuridico, '_id' | 'dataAbertura'>): Promise<ProcessoJuridico> => {
      try {
        const { data } = await api.post<ProcessoJuridico>('/api/juridico/processos', processo);
        return data;
      } catch (error) {
        throw handleApiError(error, 'Erro ao criar processo');
      }
    },

    atualizar: async (id: string, processo: Partial<ProcessoJuridico>): Promise<ProcessoJuridico> => {
      try {
        const { data } = await api.put<ProcessoJuridico>(
          `/api/juridico/processos/${id}`, 
          processo
        );
        return data;
      } catch (error) {
        throw handleApiError(error, 'Erro ao atualizar processo');
      }
    },

    remover: async (id: string): Promise<void> => {
      try {
        await api.delete(`/api/juridico/processos/${id}`);
      } catch (error) {
        throw handleApiError(error, 'Erro ao remover processo');
      }
    }
  },

  notificacoes: {
    enviar: async (tipo: string, destinatario: string, dados: Record<string, unknown>): Promise<void> => {
      const payload: NotificacaoPayload = {
        tipo,
        destinatario,
        dados,
        remetente: 'doc@imobiliariafirenze.com.br'
      };

      try {
        await api.post('/api/juridico/notificacoes', payload);
      } catch (error) {
        throw handleApiError(error, 'Erro ao enviar notificação');
      }
    }
  }
};

export default juridicoService;