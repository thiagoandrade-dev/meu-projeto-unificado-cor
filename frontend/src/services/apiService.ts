// Local: frontend/src/services/apiService.ts (Versão Final e Completa)

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://imobiliaria-firenze-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// --- INTERCEPTORS ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
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

// --- DEFINIÇÕES DE TIPOS UNIFICADAS ---

export interface Imovel {
  _id: string;
  titulo: string;
  descricao: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  valor: number;
  tipo: 'Apartamento' | 'Casa' | 'Comercial' | 'Sobrado';
  statusAnuncio: 'Disponível' | 'Alugado' | 'Vendido' | 'Manutenção';
  quartos: number;
  banheiros: number;
  vagasGaragem: number;
  area: number;
  fotos: string[];
  apartamento?: number;
  andar?: number;
  bloco?: string;
  configuracaoPlanta?: string;
  tipoVagaGaragem?: string;
  caracteristicas?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface UNIFICADA e COMPLETA para Usuário.
 * Contém todos os campos necessários para login, registro e gerenciamento.
 */
export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'inquilino';
  telefone?: string;
  status: 'Ativo' | 'Inativo'; // Adicionado
  dataRegistro?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

// --- FUNÇÃO AUXILIAR DE TRATAMENTO DE ERRO ---
function handleApiError(error: unknown, context: string): Error {
  console.error(`Erro na operação de ${context}:`, error);
  if (axios.isAxiosError(error)) {
    const apiErrorMessage = error.response?.data?.erro || error.response?.data?.message;
    if (apiErrorMessage) return new Error(String(apiErrorMessage));
    return new Error(`Erro de comunicação (${error.response?.status || 'sem resposta'}) ao ${context}.`);
  }
  return new Error(`Ocorreu um erro inesperado ao ${context}.`);
}

// --- SERVIÇOS ---

export const imoveisService = {
  getAll: async (): Promise<Imovel[]> => {
    try {
      const response = await api.get<Imovel[]>('/imoveis');
      return response.data;
    } catch (error) { throw handleApiError(error, 'listar imóveis'); }
  },
  getById: async (id: string): Promise<Imovel> => {
    try {
      const response = await api.get<Imovel>(`/imoveis/${id}`);
      return response.data;
    } catch (error) { throw handleApiError(error, `buscar o imóvel ${id}`); }
  },
  create: async (imovelData: Omit<Imovel, '_id'>): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>('/imoveis', imovelData);
      return response.data;
    } catch (error) { throw handleApiError(error, 'criar imóvel'); }
  },
  update: async (id: string, imovelData: Partial<Omit<Imovel, '_id'>>): Promise<Imovel> => {
    try {
      const response = await api.put<Imovel>(`/imoveis/${id}`, imovelData);
      return response.data;
    } catch (error) { throw handleApiError(error, `atualizar o imóvel ${id}`); }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/imoveis/${id}`);
    } catch (error) { throw handleApiError(error, `deletar o imóvel ${id}`); }
  },
};

export const authService = {
  login: async (email: string, senha: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/usuarios/login', { email, senha });
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      return { token, usuario };
    } catch (error) { throw handleApiError(error, 'fazer login'); }
  },
  register: async (userData: Omit<Usuario, '_id' | 'dataRegistro' | 'status'> & { senha?: string }): Promise<Usuario> => {
    try {
      const response = await api.post<Usuario>('/usuarios/registrar', userData);
      return response.data;
    } catch (error) { throw handleApiError(error, 'registrar novo usuário'); }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

/**
 * NOVO SERVIÇO DEDICADO PARA GERENCIAMENTO DE USUÁRIOS (CRUD)
 */
export const usuariosService = {
  getAll: async (): Promise<Usuario[]> => {
    try {
      const response = await api.get<Usuario[]>('/usuarios');
      return response.data;
    } catch(error) { throw handleApiError(error, 'listar usuários'); }
  },
  create: async (userData: Omit<Usuario, '_id' | 'dataRegistro'> & { senha?: string }): Promise<Usuario> => {
    try {
      const response = await api.post<Usuario>('/usuarios', userData);
      return response.data;
    } catch(error) { throw handleApiError(error, 'criar usuário'); }
  },
  update: async (id: string, userData: Partial<Omit<Usuario, '_id'>>): Promise<Usuario> => {
    try {
      const response = await api.put<Usuario>(`/usuarios/${id}`, userData);
      return response.data;
    } catch(error) { throw handleApiError(error, `atualizar usuário ${id}`); }
  },
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error) { throw handleApiError(error, `deletar usuário ${id}`); }
  },
  updateStatus: async (id: string, status: 'Ativo' | 'Inativo'): Promise<Usuario> => {
    try {
      const response = await api.patch<Usuario>(`/usuarios/${id}/status`, { status });
      return response.data;
    } catch (error) { throw handleApiError(error, `atualizar status do usuário ${id}`); }
  }
};