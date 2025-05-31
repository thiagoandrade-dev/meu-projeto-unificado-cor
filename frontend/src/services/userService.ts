import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosHeaders } from "axios";

// Configuração robusta da URL base
const getApiBaseUrl = (): string => {
  // 1. Prioridade para variável de ambiente
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Fallback para produção
  if (import.meta.env.PROD) {
    return 'https://meu-backend-2eb1.onrender.com';
  }
  
  // 3. Default para desenvolvimento
  return 'http://localhost:5000';
};

const API_URL = getApiBaseUrl();

// Definição do tipo de usuário
export interface User {
  _id?: string;
  id?: number | string;
  nome: string;
  email: string;
  tipo: "Administrador" | "Locatário" | "Funcionário";
  telefone?: string;
  status: "Ativo" | "Inativo";
  dataRegistro?: string;
  senha?: string;
}

interface AuthResponse {
  token: string;
  usuario: User;
}

// Configuração do axios com tipagem forte
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: new AxiosHeaders({
    'Content-Type': 'application/json'
  })
});

// Interceptor para autenticação com tratamento correto de headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || new AxiosHeaders();
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login?session_expired=true";
    }
    return Promise.reject(error);
  }
);

// Serviço de usuário com tratamento de erros aprimorado
export const userService = {
  // Autenticação
  login: async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, { 
        email, 
        senha 
      });
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha no login');
    }
  },

  // Registro
  register: async (userData: Omit<User, "id" | "_id" | "dataRegistro">): Promise<User> => {
    try {
      const response = await axios.post<User>(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha no registro');
    }
  },

  // Operações CRUD
  getAll: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/api/usuarios');
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha ao buscar usuários');
    }
  },

  getById: async (id: number | string): Promise<User> => {
    try {
      const response = await apiClient.get<User>(`/api/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha ao buscar usuário');
    }
  },

  create: async (user: Omit<User, "id" | "_id" | "dataRegistro">): Promise<User> => {
    try {
      const response = await apiClient.post<User>('/api/usuarios', user);
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha ao criar usuário');
    }
  },

  update: async (id: number | string, user: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<User>(`/api/usuarios/${id}`, user);
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha ao atualizar usuário');
    }
  },

  updateStatus: async (id: number | string, status: "Ativo" | "Inativo"): Promise<User> => {
    try {
      const response = await apiClient.patch<User>(`/api/usuarios/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw handleAuthError(error, 'Falha ao atualizar status');
    }
  },

  delete: async (id: number | string): Promise<void> => {
    try {
      await apiClient.delete(`/api/usuarios/${id}`);
    } catch (error) {
      throw handleAuthError(error, 'Falha ao deletar usuário');
    }
  },

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await axios.get(`${API_URL}/auth/verify-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Método adicional para obter usuário atual
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
};

// Tratamento centralizado de erros
function handleAuthError(error: unknown, defaultMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    const errorMessage = serverMessage || defaultMessage;
    console.error(`${errorMessage}:`, error.response?.data || error.message);
    return new Error(errorMessage);
  }
  console.error(defaultMessage, error);
  return error instanceof Error ? error : new Error(defaultMessage);
}