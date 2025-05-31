
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext, useEffect } from "react";

// Páginas Públicas
import Index from "./pages/Index";
import Imoveis from "./pages/Imoveis";
import ImovelDetalhe from "./pages/ImovelDetalhe";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Login from "./pages/Login";

// Páginas do Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminImoveis from "./pages/admin/Imoveis";
import AdminContratos from "./pages/admin/Contratos";
import AdminJuridico from "./pages/admin/Juridico";
import AdminUsuarios from "./pages/admin/Usuarios";

// Páginas do Locatário
import AreaLocatario from "./pages/locatario/AreaLocatario";

import NotFound from "./pages/NotFound";
import { authService } from "./services/apiService";

type User = {
  id: string;
  nome: string;
  email: string;
  tipo: "admin" | "locatario";
} | null;

export const AuthContext = createContext<{
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}>({
  user: null,
  setUser: () => {},
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um token salvo ao carregar a aplicação
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verificar se o token ainda é válido
          await authService.verifyToken(token);
          const userData = JSON.parse(savedUser);
          setUser({
            id: userData._id || userData.id,
            nome: userData.nome,
            email: userData.email,
            tipo: userData.tipo === "Administrador" || userData.tipo === "Funcionário" ? "admin" : "locatario"
          });
        } catch (error) {
          console.error('Token inválido, fazendo logout:', error);
          // Token inválido, limpar dados
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ user, setUser }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/imoveis" element={<Imoveis />} />
              <Route path="/imoveis/:id" element={<ImovelDetalhe />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rotas Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/imoveis" element={<AdminImoveis />} />
              <Route path="/admin/contratos" element={<AdminContratos />} />
              <Route path="/admin/juridico" element={<AdminJuridico />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              
              {/* Rotas Locatário */}
              <Route path="/locatario" element={<AreaLocatario />} />
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
