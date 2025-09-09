import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosError,
  AxiosHeaders 
} from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://meu-backend-2eb1.onrender.com';

// Configuração do Axios com tipagem segura
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: new AxiosHeaders({
    'Content-Type': 'application/json'
  })
});

// Interceptor de requisição com tipagem correta
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Garante que headers é uma instância de AxiosHeaders
      if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export interface Notificacao {
  _id?: string;
  titulo: string;
  mensagem: string;
  tipo: "info" | "warning" | "success" | "error";
  destinatario: string;
  remetente: string;
  lida: boolean;
  urgente: boolean;
  dataEnvio: string;
  dataLeitura?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailConfig {
  tipo: "cobranca" | "lembrete" | "vencimento" | "juridico" | "manutencao" | "boas-vindas";
  destinatario: string;
  assunto: string;
  dados: Record<string, unknown>;
}

export const notificationService = {
  // Notificações no sistema
  getAll: async (userId?: string): Promise<Notificacao[]> => {
    try {
      const url = userId ? `/notifications?userId=${userId}` : '/notifications';
      const response = await api.get<Notificacao[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  },

  create: async (notificacao: Omit<Notificacao, '_id' | 'dataEnvio'>): Promise<Notificacao> => {
    try {
      const response = await api.post<Notificacao>('/notifications', notificacao);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  },

  // Envio de emails automáticos
  enviarEmail: async (config: EmailConfig): Promise<void> => {
    try {
      const emailData = {
        ...config,
        remetente: getEmailRemetente(config.tipo),
        template: getEmailTemplate(config.tipo),
        timestamp: new Date().toISOString()
      };
      await api.post('/notifications/email', emailData);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  },

  // Envio de cobranças em lote
  enviarCobrancasLote: async (contratos: string[]): Promise<void> => {
    try {
      await api.post('/notifications/cobrancas-lote', {
        contratos,
        remetente: 'financeiro@imobiliariafirenze.com.br',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao enviar cobranças em lote:', error);
      throw error;
    }
  },

  // Lembretes automáticos
  criarLembretesVencimento: async (diasAntecedencia: number = 7): Promise<void> => {
    try {
      await api.post('/notifications/lembretes-vencimento', {
        diasAntecedencia,
        remetente: 'cadastro@imobiliariafirenze.com.br'
      });
    } catch (error) {
      console.error('Erro ao criar lembretes de vencimento:', error);
      throw error;
    }
  },

  // Notificações jurídicas
  enviarNotificacaoJuridica: async (tipo: string, destinatario: string, dados: Record<string, unknown>): Promise<void> => {
    try {
      await api.post('/notifications/juridico', {
        tipo,
        destinatario,
        dados,
        remetente: 'doc@imobiliariafirenze.com.br',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao enviar notificação jurídica:', error);
      throw error;
    }
  }
};

// Funções auxiliares (mantidas iguais)
const getEmailRemetente = (tipo: string): string => {
  switch (tipo) {
    case 'cobranca': return 'financeiro@imobiliariafirenze.com.br';
    case 'juridico': return 'doc@imobiliariafirenze.com.br';
    default: return 'cadastro@imobiliariafirenze.com.br';
  }
};

const getEmailTemplate = (tipo: string): string => {
  switch (tipo) {
    case 'cobranca': return 'template-cobranca';
    case 'juridico': return 'template-juridico';
    default: return 'template-padrao';
  }
};

export default notificationService;