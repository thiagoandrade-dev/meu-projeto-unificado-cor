// Local: frontend/src/contexts/AuthContext.tsx

import { createContext } from 'react';

// Tipagem para o usuário que será usado no contexto
export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: "admin" | "inquilino";
}

// Tipagem para a estrutura do nosso contexto de autenticação
export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

// Criação e exportação do Contexto de Autenticação
// Este será importado em qualquer lugar que precise de informações do usuário
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});