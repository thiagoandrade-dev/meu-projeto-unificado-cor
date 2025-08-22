
import { Link } from "react-router-dom";
import { Home, MapPin, Ruler, Bed, Bath, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Imovel } from "@/services/apiService";

interface ImovelCardProps {
  imovel: Imovel;
  featured?: boolean;
}

const ImovelCard = ({ imovel, featured = false }: ImovelCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link to={`/imoveis/${imovel.id}`}>
      <div className={`card firenze-card group ${featured ? 'lg:flex' : ''} transition-all duration-300 hover:shadow-lg`}>
        {/* Imagem */}
        <div className={`relative ${featured ? 'lg:w-2/5' : 'h-48'} overflow-hidden`}>
          <img
            src={imovel.fotos[0] || "/placeholder-imovel.svg"}
            alt={imovel.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge 
            className={`absolute top-3 left-3 ${
              imovel.operacao === "Venda" 
                ? "bg-primary text-white" 
                : "bg-secondary text-primary-dark"
            }`}
          >
            {imovel.operacao}
          </Badge>
          {imovel.destaque && (
            <Badge className="absolute top-3 right-12 bg-warning text-white">
              Destaque
            </Badge>
          )}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-colors hover:bg-white"
          >
            <Heart 
              size={18} 
              className={isFavorite ? "fill-danger text-danger" : "text-gray-400"} 
            />
          </button>
        </div>
        
        {/* Informações */}
        <div className={`p-4 ${featured ? 'lg:w-3/5' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{imovel.titulo}</h3>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(imovel.preco)}
              {imovel.operacao === "Aluguel" && <span className="text-xs text-muted">/mês</span>}
            </span>
          </div>
          
          <div className="flex items-center text-muted text-sm mb-3">
            <MapPin size={16} className="mr-1" />
            <span className="line-clamp-1">{imovel.bairro}, {imovel.cidade}</span>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted">
            <div className="flex items-center">
              <Home size={16} className="mr-1 text-primary" />
              <span>{imovel.tipo}</span>
            </div>
            <div className="flex items-center">
              <Ruler size={16} className="mr-1 text-primary" />
              <span>{imovel.areaUtil}m²</span>
            </div>
            {imovel.quartos !== undefined && (
              <div className="flex items-center">
                <Bed size={16} className="mr-1 text-primary" />
                <span>{imovel.quartos} quartos</span>
              </div>
            )}
            {imovel.banheiros !== undefined && (
              <div className="flex items-center">
                <Bath size={16} className="mr-1 text-primary" />
                <span>{imovel.banheiros} banheiros</span>
              </div>
            )}
          </div>
          
          {featured && (
            <p className="mt-3 text-muted line-clamp-2">{imovel.descricao}</p>
          )}
          
          {featured && (
            <div className="mt-4">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mr-2 mb-2">
                {imovel.caracteristicas[0]}
              </span>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mr-2 mb-2">
                {imovel.caracteristicas[1]}
              </span>
              {imovel.caracteristicas.length > 2 && (
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-2">
                  +{imovel.caracteristicas.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
