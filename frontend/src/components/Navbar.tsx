
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-page py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-imobiliaria-azul p-2 rounded">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <span className="text-imobiliaria-azul font-poppins font-bold text-xl">Firenze</span>
          </Link>
          
          {/* Links de navegação para desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-imobiliaria-azul transition-colors">
              Início
            </Link>
            <Link to="/imoveis" className="text-gray-700 hover:text-imobiliaria-azul transition-colors">
              Imóveis
            </Link>
            <Link to="/sobre" className="text-gray-700 hover:text-imobiliaria-azul transition-colors">
              Sobre
            </Link>
            <Link to="/contato" className="text-gray-700 hover:text-imobiliaria-azul transition-colors">
              Contato
            </Link>
          </div>
          
          {/* Botões */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.tipo === "admin" ? (
                  <Link to="/admin">
                    <Button variant="default" className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                      Área Admin
                    </Button>
                  </Link>
                ) : (
                  <Link to="/locatario">
                    <Button variant="default" className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                      Área do Locatário
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-imobiliaria-azul text-imobiliaria-azul hover:bg-imobiliaria-azul/5">
                    Entrar
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-imobiliaria-dourado text-imobiliaria-azul hover:bg-imobiliaria-dourado/90">
                    Registrar
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-imobiliaria-azul"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Menu mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-imobiliaria-azul transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/imoveis"
                className="text-gray-700 hover:text-imobiliaria-azul transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Imóveis
              </Link>
              <Link
                to="/sobre"
                className="text-gray-700 hover:text-imobiliaria-azul transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link
                to="/contato"
                className="text-gray-700 hover:text-imobiliaria-azul transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    {user.tipo === "admin" ? (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 w-full">
                          Área Admin
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/locatario" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 w-full">
                          Área do Locatário
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="border-imobiliaria-azul text-imobiliaria-azul hover:bg-imobiliaria-azul/5 w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="bg-imobiliaria-dourado text-imobiliaria-azul hover:bg-imobiliaria-dourado/90 w-full">
                        Registrar
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
