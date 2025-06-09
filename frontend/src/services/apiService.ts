import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// URL base da API - configurada para produção e desenvolvimento
const API_URL = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) return 'https://imobiliaria-firenze-backend.onrender.com'; // Use a URL do seu backend
  return 'http://localhost:5000';
} )();

// Criando instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de requisição para adicionar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {}; // Usar nullish coalescing
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => { // Correção: Usar AxiosError
    console.error("Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratar erros (especialmente 401)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => { // Correção: Usar AxiosError
    if (error.response?.status === 401) {
      console.warn('Erro 401: Token inválido ou expirado. Redirecionando para login.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true'; // Adicionar parâmetro opcional
      }
    }
    // Rejeitar para que o erro possa ser tratado onde a chamada foi feita
    return Promise.reject(error);
  }
);

// --- Interfaces --- 

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
  titulo?: string; // Adicionado para compatibilidade com ImovelDetalhe
  descricao?: string; // Adicionado para compatibilidade com ImovelDetalhe
  caracteristicas?: string[]; // Adicionado para compatibilidade com ImovelDetalhe
  createdAt?: string;
  updatedAt?: string;
}

export interface Usuario {
  _id?: string;
  nome: string;
  email: string;
  // Usar 'perfil' consistentemente se o backend usa 'perfil'
  perfil: "Administrador" | "Locatário" | "Funcionário"; 
  telefone?: string;
  status?: "Ativo" | "Inativo"; // Tornar opcional se não for sempre presente
  dataRegistro?: string;
}

// --- Serviços --- 

// Função auxiliar para tratamento de erros de API
function handleApiError(error: unknown, context: string): Error {
  console.error(`Erro em ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const apiErrorMessage = 
      error.response?.data?.erro || 
      (error.response?.data?.erros && error.response?.data?.erros[0] ? Object.values(error.response?.data?.erros[0])[0] : null) ||
      error.message; // Mensagem padrão do Axios se não houver outra
    return new Error(String(apiErrorMessage || `Erro na comunicação com a API (${context}).`));
  }
  return new Error(`Erro inesperado em ${context}.`);
}

// Serviço de Imóveis
export const imoveisService = {
  getAll: async (): Promise<Imovel[]> => {
    try {
      const response = await api.get<Imovel[]>('/api/imoveis');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'listar imóveis');
    }
  },

  getById: async (id: string): Promise<Imovel> => {
    try {
      const response = await api.get<Imovel>(`/api/imoveis/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `buscar imóvel ${id}`);
    }
  },

  create: async (imovelData: FormData): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>('/api/imoveis', imovelData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'criar imóvel');
    }
  },

  update: async (id: string, imovelData: FormData): Promise<Imovel> => {
    try {
      const response = await api.put<Imovel>(`/api/imoveis/${id}`, imovelData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, `atualizar imóvel ${id}`);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/imoveis/${id}`);
    } catch (error) {
      throw handleApiError(error, `deletar imóvel ${id}`);
    }
  },

  seed: async (): Promise<{ message: string; count?: number }> => { // Exemplo de tipo de retorno
    try {
      const response = await api.post<{ message: string; count?: number }>('/api/imoveis/seed');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'seed de imóveis');
    }
  }
};

// Serviço de Autenticação
export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export const authService = {
  login: async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, senha });
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      return { token, usuario };
    } catch (error) {
      throw handleApiError(error, 'login');
    }
  },

  register: async (userData: Omit<Usuario, '_id' | 'dataRegistro' | 'status'> & { senha?: string }): Promise<Usuario> => {
    try {
      // Garantir que 'perfil' seja enviado se existir em userData
      const dataToSend = { ...userData };
      const response = await api.post<Usuario>('/auth/register', dataToSend);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'registro');
    }
  },

  verifyToken: async (token: string): Promise<{ valid: boolean; usuario?: Usuario }> => {
    try {
      const response = await api.get<{ valid: boolean; usuario?: Usuario }>('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      // Se der erro (ex: 401), consideramos inválido
      console.warn('Token inválido ou erro na verificação:', error);
      return { valid: false }; 
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    // Opcional: verificar validade do token aqui se necessário
    return !!token;
  },

  getCurrentUser: (): Usuario | null => {
    const userJson = localStorage.getItem('user');
    try {
      return userJson ? JSON.parse(userJson) as Usuario : null;
    } catch (e) {
      console.error("Erro ao parsear usuário do localStorage:", e);
      localStorage.removeItem('user');
      return null;
    }
  }
};

// Serviço de Status (Exemplo)
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
      throw handleApiError(error, 'verificar status do servidor');
    }
  }
};

export default api;
