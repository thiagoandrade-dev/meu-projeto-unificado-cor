// Tipos para respostas de API e tratamento de erros

import { AxiosError } from 'axios';

// Estrutura padrão de erro da API
export interface ApiErrorResponse {
  erro?: string;
  message?: string;
  errors?: Record<string, string>[];
}

// Tipo para erros do Axios com nossa estrutura de API
export type ApiError = AxiosError<ApiErrorResponse>;

// Resposta padrão de sucesso da API
export interface ApiSuccessResponse<T = unknown> {
  sucesso: boolean;
  mensagem: string;
  data?: T;
}

// Função para verificar se um erro é do tipo ApiError
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'response' in error && 'isAxiosError' in error;
}

// Função para extrair mensagem de erro
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.erro || 
           error.response?.data?.message || 
           error.message || 
           'Erro desconhecido';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
}