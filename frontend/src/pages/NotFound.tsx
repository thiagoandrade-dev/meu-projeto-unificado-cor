
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-imobiliaria-azul rounded-full mb-6">
          <span className="text-white text-2xl font-bold">404</span>
        </div>
        <h1 className="text-3xl font-bold text-imobiliaria-azul mb-4">Página não encontrada</h1>
        <p className="text-gray-600 mb-8">
          Desculpe, não conseguimos encontrar a página que você estava procurando. Ela pode ter sido movida ou não existe mais.
        </p>
        <Link to="/">
          <Button className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2">
            <Home size={18} />
            Voltar para a página inicial
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
