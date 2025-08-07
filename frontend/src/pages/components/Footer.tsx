
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="firenze-footer">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1 - Sobre */}
          <div>
            <div className="mb-4">
              <Logo variant="white" />
            </div>
            <p className="text-white/80 mb-4">
              Há mais de 15 anos no mercado imobiliário, oferecendo os melhores imóveis 
              e serviços de administração para proprietários e inquilinos.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/80 hover:text-secondary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-secondary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-secondary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Coluna 2 - Navegação */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-secondary transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/imoveis" className="text-white/80 hover:text-secondary transition-colors">Imóveis</Link>
              </li>
              <li>
                <Link to="/sobre" className="text-white/80 hover:text-secondary transition-colors">Sobre</Link>
              </li>
              <li>
                <Link to="/contato" className="text-white/80 hover:text-secondary transition-colors">Contato</Link>
              </li>
              <li>
                <Link to="/login" className="text-white/80 hover:text-secondary transition-colors">Área do Cliente</Link>
              </li>
            </ul>
          </div>
          
          {/* Coluna 3 - Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-secondary shrink-0 mt-1" />
                <span className="text-white/80">Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-secondary shrink-0" />
                <span className="text-white/80">(11) 3456-7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-secondary shrink-0" />
                <span className="text-white/80">contato@imobiliariafirenze.com.br</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-white/60">
            © {new Date().getFullYear()} Imobiliária Firenze. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
