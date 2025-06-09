// Local: frontend/src/App.tsx (Atualizado)

import { useState, useEffect, useMemo, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthContext, User } from "@/contexts/AuthContext"; // <-- IMPORTAÇÃO ATUALIZADA

// Páginas Públicas
import Index from "@/pages/Index";
import Sobre from "@/pages/Sobre";
import Contato from "@/pages/Contato";
import Imoveis from "@/pages/Imoveis";
import ImovelDetalhe from "@/pages/ImovelDetalhe";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

// Páginas de Admin
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminImoveis from "@/pages/admin/Imoveis";
import AdminContratos from "@/pages/admin/Contratos";
import AdminUsuarios from "@/pages/admin/Usuarios";
import AdminJuridico from "@/pages/admin/Juridico";

// Páginas do Locatário
import AreaLocatario from "./pages/locatario/AreaLocatario";

// Componente de Rota Protegida
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole: 'admin' | 'inquilino' }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    if (!user || user.tipo !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
            id: parsedUser.id || parsedUser._id,
            nome: parsedUser.nome,
            email: parsedUser.email,
            tipo: parsedUser.perfil
        });
      } catch (error) {
        console.error("Erro ao ler dados do usuário do localStorage", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const authContextValue = useMemo(() => ({ user, setUser, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/imoveis" element={<Imoveis />} />
              <Route path="/imovel/:id" element={<ImovelDetalhe />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/login" element={<Login />} />

              {/* Rotas Protegidas do Admin */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/imoveis" element={<ProtectedRoute requiredRole="admin"><AdminImoveis /></ProtectedRoute>} />
              <Route path="/admin/contratos" element={<ProtectedRoute requiredRole="admin"><AdminContratos /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute requiredRole="admin"><AdminUsuarios /></ProtectedRoute>} />
              <Route path="/admin/juridico" element={<ProtectedRoute requiredRole="admin"><AdminJuridico /></ProtectedRoute>} />

              {/* Rota Protegida do Locatário/Inquilino */}
              <Route path="/locatario" element={<ProtectedRoute requiredRole="inquilino"><AreaLocatario /></ProtectedRoute>} />

              {/* Rota Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;