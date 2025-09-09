// Local: frontend/src/contexts/AuthContext.tsx

import { createContext } from 'react';
import { Inquilino } from '@/services/apiService';

// Tipagem para a estrutura do nosso contexto de autenticação
export interface AuthContextType {
  user: Inquilino | null;
  setUser: React.Dispatch<React.SetStateAction<Inquilino | null>>;
  loading: boolean;
}

// Criação e exportação do Contexto de Autenticação
// Este será importado em qualquer lugar que precise de informações do usuário
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});