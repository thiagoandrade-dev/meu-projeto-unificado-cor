
import { Link } from "react-router-dom";
import { Home, MapPin, Ruler, Bed, Bath, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Imovel } from "@/services/apiService";
import { buildImageUrl } from "@/utils/imageUtils";
import SmartImage from "@/components/SmartImage";

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
    <Link to={`/imovel/${imovel._id}`}>
      <div className={`card firenze-card group ${featured ? 'lg:flex' : ''} transition-all duration-300 hover:shadow-lg`}>
        {/* Imagem */}
        <div className={`relative ${featured ? 'lg:w-2/5' : ''} overflow-hidden`}>
          <SmartImage
            src={buildImageUrl(imovel.imagens?.[0]?.original || '')}
            alt={`${imovel.configuracaoPlanta} - Grupo ${imovel.grupo}, Bloco ${imovel.bloco}`}
            aspectRatio={featured ? 'landscape' : 'square'}
            className="transition-transform duration-500 group-hover:scale-105"
            containerClassName={featured ? '' : 'h-48'}
          />
          <Badge 
            className={`absolute top-3 left-3 ${
              imovel.statusAnuncio === "Disponível para Venda" 
                ? "bg-primary text-white" 
                : "bg-secondary text-primary-dark"
            }`}
          >
            {imovel.statusAnuncio === "Disponível para Venda" ? "Venda" : "Locação"}
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
            <h3 className="text-lg font-semibold line-clamp-1">
              {imovel.configuracaoPlanta} - Grupo {imovel.grupo}, Bloco {imovel.bloco}
            </h3>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(imovel.preco)}
              {imovel.statusAnuncio === "Disponível para Locação" && <span className="text-xs text-muted">/mês</span>}
            </span>
          </div>
          
          <div className="flex items-center text-muted text-sm mb-3">
            <MapPin size={16} className="mr-1" />
            <span className="line-clamp-1">
              Grupo {imovel.grupo}, Bloco {imovel.bloco}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted">
            <div className="flex items-center">
              <Home size={16} className="mr-1 text-primary" />
              <span>Apartamento</span>
            </div>
            <div className="flex items-center">
              <Ruler size={16} className="mr-1 text-primary" />
              <span>{imovel.areaUtil}m²</span>
            </div>
            <div className="flex items-center">
              <Bed size={16} className="mr-1 text-primary" />
              <span>
                {imovel.configuracaoPlanta.includes('2 dorms') ? '2' : imovel.configuracaoPlanta.includes('Padrão') ? '2' : '3'} quartos
              </span>
            </div>
            {imovel.numVagasGaragem && (
              <div className="flex items-center">
                <Bath size={16} className="mr-1 text-primary" />
                <span>{imovel.numVagasGaragem} vaga{imovel.numVagasGaragem > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          {featured && (
            <p className="mt-3 text-muted line-clamp-2">
              {imovel.configuracaoPlanta} - {imovel.areaUtil}m² úteis
            </p>
          )}
          
          {featured && (
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                {imovel.numVagasGaragem} vaga{imovel.numVagasGaragem !== 1 ? 's' : ''}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                Andar {imovel.andar}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                Apto {imovel.apartamento}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
