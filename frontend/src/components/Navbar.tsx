
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import Logo from "./Logo";
import { userService } from "@/services/userService";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Efeito para aplicar o tema escuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Efeito para detectar o tema do sistema
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    userService.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-card shadow-md">
      <div className="container-page py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo variant={isDarkMode ? 'white' : 'default'} />
          </Link>
          
          {/* Links de navegação para desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/imoveis" className="text-foreground hover:text-primary transition-colors">
              Imóveis
            </Link>
            <Link to="/sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/contato" className="text-foreground hover:text-primary transition-colors">
              Contato
            </Link>
          </div>
          
          {/* Botões */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            {user ? (
              <>
                {user.perfil === "admin" ? (
                  <Link to="/admin">
                    <Button variant="default" className="bg-primary hover:bg-primary-dark">
                      Área Admin
                    </Button>
                  </Link>
                ) : (
                  <Link to="/locatario">
                    <Button variant="default" className="bg-primary hover:bg-primary-dark">
                      Área do Locatário
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Entrar
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-secondary text-primary-dark hover:bg-secondary-dark">
                    Registrar
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary"
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
                className="text-foreground hover:text-primary transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/imoveis"
                className="text-foreground hover:text-primary transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Imóveis
              </Link>
              <Link
                to="/sobre"
                className="text-foreground hover:text-primary transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link
                to="/contato"
                className="text-foreground hover:text-primary transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    {user.perfil === "admin" ? (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" className="bg-primary hover:bg-primary-dark w-full">
                          Área Admin
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/locatario" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="default" className="bg-primary hover:bg-primary-dark w-full">
                          Área do Locatário
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-50 w-full flex items-center justify-center gap-2"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut size={16} />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 w-full">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="bg-secondary text-primary-dark hover:bg-secondary-dark w-full">
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
