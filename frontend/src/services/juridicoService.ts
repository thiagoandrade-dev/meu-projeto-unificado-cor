// Local: frontend/src/services/juridicoService.ts

import { api, handleApiError } from './apiService'; // CORREÇÃO: Importando corretamente
import axios from 'axios';

// --- SUAS INTERFACES ORIGINAIS (MANTIDAS E COMPLETADAS) ---
export type DocumentoTipo = "Contrato" | "Adendo" | "Notificação" | "Procuração" | "Distrato" | "Vistoria" | "Outros";
export type DocumentoStatus = "Ativo" | "Arquivado" | "Pendente";

export interface DocumentoJuridico {
  _id: string;
  titulo: string;
  tipo: string;
  descricao: string;
  autor?: string;     // <-- Tornar autor opcional, pois o erro indicou que pode ser undefined
  contratoRelacionado?: string;
  imovelRelacionado?: string;
  status: string;
  tags: string[];
  observacoes?: string;
  dataCriacao: string; // <-- A propriedade que você usa é 'dataCriacao'
  createdAt?: string;   // <-- Adicionar para consistência, se o backend enviar
  updatedAt?: string;
  arquivo?: string;     // ✅ Adicionar esta propriedade para o link de download
  formato?: string;     // ✅ Adicionar esta propriedade para a extensão do arquivo
}

export type ProcessoTipo = "Despejo" | "Cobrança" | "Danos" | "Distrato" | "Renovação" | "Outros";
export type ProcessoStatus = "Aberto" | "Em Andamento" | "Concluído" | "Arquivado";
export type ProcessoPrioridade = "Baixa" | "Média" | "Alta" | "Urgente";

export interface ProcessoJuridico {
  _id: string;
  numero: string;
  tipo: ProcessoTipo;
  contratoId: string;
  status: ProcessoStatus;
  prioridade: ProcessoPrioridade;
  descricao: string;
  advogadoResponsavel: string;
  dataAbertura: string;
  dataPrazo?: string;
  documentos?: string[];
  observacoes?: string;
  valor?: number;
  partesEnvolvidas: string; // CORREÇÃO: Campo agora está presente e é obrigatório
}

export interface NotificacaoJuridica {
  tipo: string;
  destinatario: string;
  assunto?: string;      // ✅ Adicionado
  corpo: string;          // ✅ 'mensagem' foi renomeada para 'corpo' para maior clareza
  remetente?: string;
  timestamp?: string;    // ✅ Adicionado
}

// --- SERVIÇO JURÍDICO PADRONIZADO ---
export const juridicoService = {
  documentos: {
    // PADRONIZADO de 'listar' para 'getAll'
    getAll: async (): Promise<DocumentoJuridico[]> => {
      try {
        const { data } = await api.get<DocumentoJuridico[]>('/juridico/documentos');
        return data;
      } catch (error) { throw handleApiError(error, 'listar documentos'); }
    },
    // PADRONIZADO de 'criar' para 'create'
    create: async (formData: FormData): Promise<DocumentoJuridico> => {
      try {
        const { data } = await api.post<DocumentoJuridico>('/juridico/documentos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
      } catch (error) { throw handleApiError(error, 'criar documento'); }
    },
    // PADRONIZADO de 'atualizar' para 'update'
    update: async (id: string, documento: Partial<DocumentoJuridico>): Promise<DocumentoJuridico> => {
      try {
        const { data } = await api.put<DocumentoJuridico>(`/juridico/documentos/${id}`, documento);
        return data;
      } catch (error) { throw handleApiError(error, 'atualizar documento'); }
    },
    // PADRONIZADO de 'remover' para 'delete'
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/juridico/documentos/${id}`);
      } catch (error) { throw handleApiError(error, 'remover documento'); }
    }
  },
  processos: {
    getAll: async (): Promise<ProcessoJuridico[]> => {
      try {
        const { data } = await api.get<ProcessoJuridico[]>('/juridico/processos');
        return data;
      } catch (error) { throw handleApiError(error, 'listar processos'); }
    },
    create: async (processo: Omit<ProcessoJuridico, '_id' | 'dataAbertura'>): Promise<ProcessoJuridico> => {
      try {
        const { data } = await api.post<ProcessoJuridico>('/juridico/processos', processo);
        return data;
      } catch (error) { throw handleApiError(error, 'criar processo'); }
    },
    update: async (id: string, processo: Partial<ProcessoJuridico>): Promise<ProcessoJuridico> => {
      try {
        const { data } = await api.put<ProcessoJuridico>(`/juridico/processos/${id}`, processo);
        return data;
      } catch (error) { throw handleApiError(error, 'atualizar processo'); }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/juridico/processos/${id}`);
      } catch (error) { throw handleApiError(error, 'remover processo'); }
    }
  },
  notificacoes: {
    // PADRONIZADO de 'enviar' para 'send'
    send: async (notificacaoData: NotificacaoJuridica): Promise<void> => {
      try {
        await api.post('/juridico/notificacoes', {
          ...notificacaoData,
          remetente: 'doc@imobiliariafirenze.com.br'
        });
      } catch (error) { throw handleApiError(error, 'enviar notificação'); }
    }
  }
};
