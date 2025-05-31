import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// URL base da API - configurada para produção e desenvolvimento
const API_URL = (() => {
  // 1. Prioridade: variável de ambiente
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // 2. Fallback para produção
  if (import.meta.env.PROD) return 'https://meu-backend-2eb1.onrender.com';
  
  // 3. Fallback para desenvolvimento
  return 'http://localhost:5000';
})();

// Criando instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar o token de autenticação em cada requisição
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Assegura que headers existem antes de tentar atribuir
      config.headers = config.headers || {}; 
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    // Você pode usar AxiosError aqui se quiser tratamento mais específico
    // (error: AxiosError) => { ... }
    return Promise.reject(error);
  }
);

// Interceptador para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    // Você pode usar AxiosError aqui se quiser tratamento mais específico
    // (error: AxiosError) => { ... }
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn('Erro 401: Token inválido ou expirado. Redirecionando para login.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Evita redirecionamento se já estiver na página de login
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Interface para imóvel baseada no modelo do backend
export interface Imovel {
  _id?: string;
  grupo: number;
  bloco: string;
  andar: number;
  apartamento: number;
  configuracaoPlanta: string;
  areaUtil: number;
  numVagasGaragem: number;
  tipoVagaGaragem: string;
  preco: number;
  statusAnuncio: "Disponível" | "Alugado" | "Manutenção" | "Reservado";
  imagens?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface para usuário
export interface Usuario {
  _id?: string;
  nome: string;
  email: string;
  tipo: "Administrador" | "Locatário" | "Funcionário";
  telefone?: string;
  status: "Ativo" | "Inativo";
  dataRegistro?: string;
}

// Serviço de API para imóveis
export const imoveisService = {
  // Listar todos os imóveis
  getAll: async (): Promise<Imovel[]> => {
    try {
      const response = await api.get<Imovel[]>('/api/imoveis');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar imóveis:', error);
      throw error;
    }
  },

  // Buscar imóvel por ID
  getById: async (id: string): Promise<Imovel> => {
    try {
      const response = await api.get<Imovel>(`/api/imoveis/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar imóvel ${id}:`, error);
      throw error;
    }
  },

  // Criar novo imóvel
  create: async (imovelData: FormData): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>('/api/imoveis', imovelData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar imóvel:', error);
      throw error;
    }
  },

  // Atualizar imóvel
  update: async (id: string, imovelData: FormData): Promise<Imovel> => {
    try {
      const response = await api.put<Imovel>(`/api/imoveis/${id}`, imovelData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar imóvel ${id}:`, error);
      throw error;
    }
  },

  // Deletar imóvel
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/imoveis/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar imóvel ${id}:`, error);
      throw error;
    }
  },

  // Seed - criar imóveis de teste
  seed: async () => {
    try {
      const response = await api.post('/api/imoveis/seed');
      return response.data; // Ajustar tipo de retorno se necessário
    } catch (error) {
      console.error('Erro ao executar seed de imóveis:', error);
      throw error;
    }
  }
};

// Serviço de autenticação
export const authService = {
  // Login
  login: async (email: string, senha: string): Promise<{ token: string; usuario: Usuario }> => {
    try {
      const response = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha });
      const { token, usuario } = response.data;
      
      // Salvar token e dados do usuário
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return { token, usuario };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  // Registro
  register: async (userData: Omit<Usuario, '_id' | 'dataRegistro'>): Promise<Usuario> => {
    try {
      const response = await api.post<Usuario>('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  },

  // Verificar token
  verifyToken: async (token: string): Promise<{ valid: boolean; usuario?: Usuario }> => {
    try {
      const response = await api.get<{ valid: boolean; usuario?: Usuario }>('/auth/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar status da autenticação
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obter usuário atual
  getCurrentUser: (): Usuario | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) as Usuario : null;
  }
};

// Verificar status do servidor
interface ServerStatus {
  status: string;
  database: string;
  timestamp: string;
}

export const statusService = {
  check: async (): Promise<ServerStatus> => {
    try {
      const response = await api.get<ServerStatus>('/api/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do servidor:', error);
      throw error;
    }
  }
};

export default api;

