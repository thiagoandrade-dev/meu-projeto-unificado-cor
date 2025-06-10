
import { Link } from "react-router-dom";
import { Home, MapPin, Ruler, Bed, Bath } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Imovel = {
  id: string;
  titulo: string;
  tipo: "Apartamento" | "Casa" | "Comercial" | "Terreno";
  operacao: "Venda" | "Aluguel";
  preco: number;
  precoCondominio?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  areaUtil: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  descricao: string;
  caracteristicas: string[];
  fotos: string[];
  destaque: boolean;
  grupo?: string;
};

interface ImovelCardProps {
  imovel: Imovel;
  featured?: boolean;
}

const ImovelCard = ({ imovel, featured = false }: ImovelCardProps) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Link to={`/imoveis/${imovel.id}`}>
      <div className={`card-imovel group ${featured ? 'lg:flex' : ''}`}>
        {/* Imagem */}
        <div className={`relative ${featured ? 'lg:w-2/5' : 'h-48'} overflow-hidden`}>
          <img
            src={imovel.fotos[0] || "https://images.unsplash.com/photo-1582562124811-c09040d0a901"}
            alt={imovel.titulo}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <Badge 
            className={`absolute top-3 left-3 ${
              imovel.operacao === "Venda" 
                ? "bg-imobiliaria-azul" 
                : "bg-imobiliaria-dourado text-imobiliaria-azul"
            }`}
          >
            {imovel.operacao}
          </Badge>
          {imovel.destaque && (
            <Badge className="absolute top-3 right-3 bg-yellow-500">
              Destaque
            </Badge>
          )}
        </div>
        
        {/* Informações */}
        <div className={`p-4 ${featured ? 'lg:w-3/5' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{imovel.titulo}</h3>
            <span className="text-lg font-bold text-imobiliaria-azul">
              {formatCurrency(imovel.preco)}
              {imovel.operacao === "Aluguel" && <span className="text-xs text-gray-500">/mês</span>}
            </span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin size={16} className="mr-1" />
            <span className="line-clamp-1">{imovel.bairro}, {imovel.cidade}</span>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Home size={16} className="mr-1 text-imobiliaria-azul" />
              <span>{imovel.tipo}</span>
            </div>
            <div className="flex items-center">
              <Ruler size={16} className="mr-1 text-imobiliaria-azul" />
              <span>{imovel.areaUtil}m²</span>
            </div>
            {imovel.quartos !== undefined && (
              <div className="flex items-center">
                <Bed size={16} className="mr-1 text-imobiliaria-azul" />
                <span>{imovel.quartos} quartos</span>
              </div>
            )}
            {imovel.banheiros !== undefined && (
              <div className="flex items-center">
                <Bath size={16} className="mr-1 text-imobiliaria-azul" />
                <span>{imovel.banheiros} banheiros</span>
              </div>
            )}
          </div>
          
          {featured && (
            <p className="mt-3 text-gray-600 line-clamp-2">{imovel.descricao}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ImovelCard;
