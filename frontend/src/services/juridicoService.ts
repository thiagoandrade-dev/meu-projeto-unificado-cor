// Local: frontend/src/services/juridicoService.ts

import { api, handleApiError } from './apiService'; // CORREÇÃO: Importando corretamente
import { CasoJuridicoAPI, CasoJuridicoInput, ApiResponse } from '@/types/juridico';

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
    // PADRONIZADO de 'listar' para 'getAll' - agora busca casos jurídicos
    getAll: async (): Promise<DocumentoJuridico[]> => {
      try {
        const { data } = await api.get<ApiResponse<CasoJuridicoAPI[]>>('/juridico');
        // O backend retorna casos jurídicos, vamos adaptar para a interface esperada
        if (data.success && data.data) {
          return data.data.map((caso: CasoJuridicoAPI): DocumentoJuridico => {
            const documento: DocumentoJuridico = {
              _id: caso._id,
              titulo: caso.titulo || 'Caso Jurídico',
              tipo: caso.tipoAcao || 'Outros',
              descricao: caso.descricao || '',
              autor: caso.advogadoResponsavel || 'Sistema',
              status: caso.status || 'Ativo',
              tags: caso.tags || [],
              dataCriacao: caso.createdAt || new Date().toISOString()
            };
            if (caso.contratoId) documento.contratoRelacionado = caso.contratoId;
            if (caso.imovelId) documento.imovelRelacionado = caso.imovelId;
            if (caso.observacoes) documento.observacoes = caso.observacoes;
            if (caso.createdAt) documento.createdAt = caso.createdAt;
            if (caso.updatedAt) documento.updatedAt = caso.updatedAt;
            return documento;
          });
        }
        return [];
      } catch (error) { throw handleApiError(error, 'listar casos jurídicos'); }
    },
    // PADRONIZADO de 'criar' para 'create' - agora cria caso jurídico
    create: async (casoData: CasoJuridicoInput): Promise<DocumentoJuridico> => {
      try {
        const { data } = await api.post('/juridico', casoData);
        if (data.success && data.data) {
          return {
            _id: data.data._id,
            titulo: data.data.titulo || 'Caso Jurídico',
            tipo: data.data.tipoAcao || 'Outros',
            descricao: data.data.descricao || '',
            autor: data.data.advogadoResponsavel || 'Sistema',
            contratoRelacionado: data.data.contratoId,
            imovelRelacionado: data.data.imovelId,
            status: data.data.status || 'Ativo',
            tags: data.data.tags || [],
            observacoes: data.data.observacoes || '',
            dataCriacao: data.data.createdAt || new Date().toISOString(),
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt
          };
        }
        throw new Error('Resposta inválida do servidor');
      } catch (error) { throw handleApiError(error, 'criar caso jurídico'); }
    },
    // PADRONIZADO de 'atualizar' para 'update'
    update: async (id: string, casoData: Partial<CasoJuridicoInput>): Promise<DocumentoJuridico> => {
      try {
        const { data } = await api.put(`/juridico/${id}`, casoData);
        if (data.success && data.data) {
          return {
            _id: data.data._id,
            titulo: data.data.titulo || 'Caso Jurídico',
            tipo: data.data.tipoAcao || 'Outros',
            descricao: data.data.descricao || '',
            autor: data.data.advogadoResponsavel || 'Sistema',
            contratoRelacionado: data.data.contratoId,
            imovelRelacionado: data.data.imovelId,
            status: data.data.status || 'Ativo',
            tags: data.data.tags || [],
            observacoes: data.data.observacoes || '',
            dataCriacao: data.data.createdAt || new Date().toISOString(),
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt
          };
        }
        throw new Error('Resposta inválida do servidor');
      } catch (error) { throw handleApiError(error, 'atualizar caso jurídico'); }
    },
    // PADRONIZADO de 'remover' para 'delete'
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/juridico/${id}`);
      } catch (error) { throw handleApiError(error, 'remover caso jurídico'); }
    }
  },
  processos: {
    getAll: async (): Promise<ProcessoJuridico[]> => {
      try {
        const { data } = await api.get<ApiResponse<CasoJuridicoAPI[]>>('/juridico');
        // O backend retorna casos jurídicos, vamos adaptar para a interface de processos
        if (data.success && data.data) {
          return data.data.map((caso: CasoJuridicoAPI): ProcessoJuridico => {
            const processo: ProcessoJuridico = {
              _id: caso._id,
              numero: caso.numeroProcesso || `PROC-${caso._id?.slice(-6)}`,
              tipo: (caso.tipoAcao as ProcessoTipo) || 'Outros',
              contratoId: caso.contratoId || '',
              status: (caso.status as ProcessoStatus) || 'Aberto',
              prioridade: (caso.prioridade as ProcessoPrioridade) || 'Média',
              descricao: caso.descricao || '',
              advogadoResponsavel: caso.advogadoResponsavel || 'Sistema',
              dataAbertura: caso.createdAt || new Date().toISOString(),
              partesEnvolvidas: caso.partesEnvolvidas || 'Não informado'
            };
            if (caso.dataPrazo) processo.dataPrazo = caso.dataPrazo;
            if (caso.documentos) processo.documentos = caso.documentos;
            if (caso.observacoes) processo.observacoes = caso.observacoes;
            if (caso.valor !== undefined) processo.valor = caso.valor;
            return processo;
          });
        }
        return [];
      } catch (error) { throw handleApiError(error, 'listar processos jurídicos'); }
    },
    create: async (processo: Omit<ProcessoJuridico, '_id' | 'dataAbertura'>): Promise<ProcessoJuridico> => {
      try {
        const casoData = {
          titulo: `Processo ${processo.numero}`,
          descricao: processo.descricao,
          tipoAcao: processo.tipo,
          status: processo.status,
          prioridade: processo.prioridade,
          advogadoResponsavel: processo.advogadoResponsavel,
          contratoId: processo.contratoId,
          numeroProcesso: processo.numero,
          dataPrazo: processo.dataPrazo,
          observacoes: processo.observacoes,
          valor: processo.valor,
          partesEnvolvidas: processo.partesEnvolvidas
        };
        
        const { data } = await api.post('/juridico', casoData);
        if (data.success && data.data) {
          return {
            _id: data.data._id,
            numero: data.data.numeroProcesso || processo.numero,
            tipo: (data.data.tipoAcao as ProcessoTipo) || processo.tipo,
            contratoId: data.data.contratoId || processo.contratoId,
            status: (data.data.status as ProcessoStatus) || processo.status,
            prioridade: (data.data.prioridade as ProcessoPrioridade) || processo.prioridade,
            descricao: data.data.descricao || processo.descricao,
            advogadoResponsavel: data.data.advogadoResponsavel || processo.advogadoResponsavel,
            dataAbertura: data.data.createdAt || new Date().toISOString(),
            dataPrazo: data.data.dataPrazo,
            documentos: data.data.documentos || [],
            observacoes: data.data.observacoes,
            valor: data.data.valor,
            partesEnvolvidas: data.data.partesEnvolvidas || processo.partesEnvolvidas
          };
        }
        throw new Error('Resposta inválida do servidor');
      } catch (error) { throw handleApiError(error, 'criar processo jurídico'); }
    },
    update: async (id: string, processo: Partial<ProcessoJuridico>): Promise<ProcessoJuridico> => {
      try {
        const casoData = {
          titulo: processo.numero ? `Processo ${processo.numero}` : undefined,
          descricao: processo.descricao,
          tipoAcao: processo.tipo,
          status: processo.status,
          prioridade: processo.prioridade,
          advogadoResponsavel: processo.advogadoResponsavel,
          contratoId: processo.contratoId,
          numeroProcesso: processo.numero,
          dataPrazo: processo.dataPrazo,
          observacoes: processo.observacoes,
          valor: processo.valor,
          partesEnvolvidas: processo.partesEnvolvidas
        };
        
        const { data } = await api.put(`/juridico/${id}`, casoData);
        if (data.success && data.data) {
          return {
            _id: data.data._id,
            numero: data.data.numeroProcesso || processo.numero || '',
            tipo: (data.data.tipoAcao as ProcessoTipo) || processo.tipo || 'Outros',
            contratoId: data.data.contratoId || processo.contratoId || '',
            status: (data.data.status as ProcessoStatus) || processo.status || 'Aberto',
            prioridade: (data.data.prioridade as ProcessoPrioridade) || processo.prioridade || 'Média',
            descricao: data.data.descricao || processo.descricao || '',
            advogadoResponsavel: data.data.advogadoResponsavel || processo.advogadoResponsavel || '',
            dataAbertura: data.data.createdAt || new Date().toISOString(),
            dataPrazo: data.data.dataPrazo,
            documentos: data.data.documentos || [],
            observacoes: data.data.observacoes,
            valor: data.data.valor,
            partesEnvolvidas: data.data.partesEnvolvidas || processo.partesEnvolvidas || ''
          };
        }
        throw new Error('Resposta inválida do servidor');
      } catch (error) { throw handleApiError(error, 'atualizar processo jurídico'); }
    },
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/juridico/${id}`);
      } catch (error) { throw handleApiError(error, 'remover processo jurídico'); }
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
