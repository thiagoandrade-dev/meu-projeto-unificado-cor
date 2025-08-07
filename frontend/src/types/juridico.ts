// Tipos específicos para o módulo jurídico

// Resposta da API para casos jurídicos
export interface CasoJuridicoAPI {
  _id: string;
  titulo?: string;
  tipoAcao?: string;
  descricao?: string;
  advogadoResponsavel?: string;
  contratoId?: string;
  imovelId?: string;
  status?: string;
  tags?: string[];
  observacoes?: string;
  numeroProcesso?: string;
  dataPrazo?: string;
  valor?: number;
  partesEnvolvidas?: string;
  documentos?: string[];
  prioridade?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dados para criação/atualização de caso jurídico
export interface CasoJuridicoInput {
  titulo: string;
  descricao: string;
  tipoAcao: string;
  status: string;
  prioridade: string;
  advogadoResponsavel: string;
  contratoId?: string;
  imovelId?: string;
  numeroProcesso?: string;
  dataPrazo?: string;
  observacoes?: string;
  valor?: number;
  partesEnvolvidas?: string;
  tags?: string[];
  documentos?: string[];
}

// Resposta padrão da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}