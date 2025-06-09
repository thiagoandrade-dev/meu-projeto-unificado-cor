// Local: frontend/src/services/apiService.ts

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Usando sua URL de backend do Render.com
const API_URL = import.meta.env.VITE_API_URL || 'https://meu-backend-2eb1.onrender.com/api';

// CORREÇÃO: 'api' agora é exportada para ser usada por outros serviços.
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- Interceptors ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);


// --- FUNÇÃO DE TRATAMENTO DE ERRO (ÚNICA E EXPORTADA) ---
// CORREÇÃO: 'handleApiError' agora é exportada.
export function handleApiError(error: unknown, context: string): Error {
  console.error(`Erro na operação de ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { message?: string, erro?: string };
    const apiErrorMessage = responseData?.message || responseData?.erro;
    if (apiErrorMessage) return new Error(String(apiErrorMessage));
    return new Error(`Erro de comunicação com o servidor (${error.response?.status || 'sem resposta'}) ao ${context}.`);
  }
  return new Error(`Ocorreu um erro inesperado ao ${context}.`);
}


// --- DEFINIÇÕES DE TIPOS UNIFICADAS (A FONTE DA VERDADE) ---

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'inquilino';
  telefone?: string;
  status: 'Ativo' | 'Inativo';
  dataRegistro?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

// --- SERVIÇOS UNIFICADOS (TODOS EXPORTADOS DAQUI) ---

export const authService = {
  login: async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      const { data } = await api.post<AuthResponse>('/usuarios/login', { email, senha });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      return data;
    } catch (error) { throw handleApiError(error, 'fazer login'); }
  },
  register: async (userData: Omit<Usuario, '_id' | 'dataRegistro' | 'status'> & { senha?: string }): Promise<Usuario> => {
    try {
      const { data } = await api.post<Usuario>('/usuarios/registrar', userData);
      return data;
    } catch (error) { throw handleApiError(error, 'registrar novo usuário'); }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

// CORREÇÃO: Restaurando o 'usuariosService' que foi removido por engano.
export const usuariosService = {
  getAll: async (): Promise<Usuario[]> => {
    try {
      const { data } = await api.get<Usuario[]>('/usuarios');
      return data;
    } catch(error) { throw handleApiError(error, 'listar usuários'); }
  },
  create: async (userData: Omit<Usuario, '_id' | 'dataRegistro'> & { senha?: string }): Promise<Usuario> => {
    try {
      const { data } = await api.post<Usuario>('/usuarios', userData);
      return data;
    } catch(error) { throw handleApiError(error, 'criar usuário'); }
  },
  update: async (id: string, userData: Partial<Omit<Usuario, '_id'>> & { senha?: string }): Promise<Usuario> => {
    try {
      const { data } = await api.put<Usuario>(`/usuarios/${id}`, userData);
      return data;
    } catch(error) { throw handleApiError(error, `atualizar usuário ${id}`); }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error) { throw handleApiError(error, `deletar usuário ${id}`); }
  },
  updateStatus: async (id: string, status: 'Ativo' | 'Inativo'): Promise<Usuario> => {
    try {
      const { data } = await api.patch<Usuario>(`/usuarios/${id}/status`, { status });
      return data;
    } catch (error) { throw handleApiError(error, `atualizar status do usuário ${id}`); }
  }
};
