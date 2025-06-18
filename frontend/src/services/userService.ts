import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosHeaders } from "axios";

// Configuração robusta da URL base
const getApiBaseUrl = (): string => {
  // 1. Prioridade para variável de ambiente
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Fallback para produção (Verifique se esta URL está correta!)
  if (import.meta.env.PROD) {
    // Use a URL real do seu backend no Render
    return 'https://imobiliaria-firenze-backend.onrender.com'; // <-- CONFIRME ESTA URL
  }
  
  // 3. Default para desenvolvimento
  return 'http://localhost:5000';
};

const API_URL = getApiBaseUrl( );

// Definição do tipo de usuário (Sincronizado com backend)
export interface User {
  _id?: string; // Vem do MongoDB
  id?: string; // Pode ser o mesmo que _id
  nome: string;
  email: string;
  perfil: "admin" | "inquilino"; // <-- Corrigido de 'tipo' para 'perfil'
  // telefone?: string; // Removido se não for usado consistentemente
  // status?: "Ativo" | "Inativo"; // Removido se não for usado consistentemente
  dataRegistro?: string;
  // senha?: string; // Senha não deve ser parte do tipo User retornado pela API
}

// Correção: Exportar AuthResponse
export interface AuthResponse {
  token: string;
  usuario: User; // Usa a interface User atualizada
}

// Tipo para os dados enviados no registro (apenas os campos necessários)
// Correção: Incluir 'perfil' e 'senha', omitir campos gerados
export type RegisterUserData = Pick<User, "nome" | "email" | "perfil"> & {
  senha: string; // Senha é obrigatória para registro
};

// Configuração do axios com tipagem forte
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: new AxiosHeaders({
    'Content-Type': 'application/json'
  })
});

// Interceptor para autenticação
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || new AxiosHeaders();
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Interceptor para tratamento de erros (exemplo básico)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Limpar dados locais em caso de não autorizado
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirecionar para login (opcional)
      // window.location.href = "/login?session_expired=true";
      console.error("Erro 401: Não autorizado ou token expirado.");
    }
    // Rejeitar a promessa para que o erro possa ser tratado no local da chamada
    return Promise.reject(error);
  }
);

// Função auxiliar para tratamento de erros (simplificada)
function handleApiError(error: unknown, context: string): Error {
  console.error(`Erro em ${context}:`, error);
  if (axios.isAxiosError(error)) {
    // Tenta extrair uma mensagem de erro mais útil do backend
    const apiErrorMessage = error.response?.data?.erro || (error.response?.data?.erros && error.response?.data?.erros[0] ? Object.values(error.response?.data?.erros[0])[0] : null);
    return new Error(apiErrorMessage || `Erro na comunicação com a API (${context}). Status: ${error.response?.status || 'N/A'}`);
  }
  return new Error(`Erro inesperado em ${context}.`);
}

// Serviço de usuário com tipos corrigidos
export const userService = {
  // Autenticação
  login: async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      // Usar apiClient que já tem baseURL configurada
      const response = await apiClient.post<AuthResponse>("/api/auth/login", { 
        email, 
        senha // Backend espera 'senha'
      });
      return response.data; // Axios já encapsula em 'data'
    } catch (error) {
      throw handleApiError(error, 'login');
    }
  },

  // Registro
  // Correção: Usar o tipo RegisterUserData que inclui 'perfil' e 'senha'
  register: async (userData: RegisterUserData): Promise<User> => {
    try {
      // Usar apiClient
      const response = await apiClient.post<User>("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'register');
    }
  },

  // Operações CRUD (Exemplo - ajuste os endpoints se necessário)
  getAll: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/api/usuarios'); // Endpoint de exemplo
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'buscar usuários');
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<User>(`/api/usuarios/${id}`); // Endpoint de exemplo
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'buscar usuário');
    }
  },

  // create, update, delete - Implementar se necessário, seguindo o padrão

  // Verificar token (exemplo, ajuste endpoint se necessário)
  verifyToken: async (): Promise<boolean> => {
    try {
      // Usa apiClient que já envia o token
      await apiClient.get('/auth/verify-token'); // Endpoint de exemplo
      return true;
    } catch (error) {
      // Se der erro (ex: 401), o interceptor já pode ter limpado o token
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Opcional: redirecionar ou atualizar estado global
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem("user");
    try {
      return userJson ? JSON.parse(userJson) as User : null;
    } catch (e) {
      console.error("Erro ao parsear usuário do localStorage:", e);
      localStorage.removeItem("user"); // Limpar dado inválido
      return null;
    }
  }
};
