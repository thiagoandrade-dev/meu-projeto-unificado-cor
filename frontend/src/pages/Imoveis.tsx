
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertySearch from "@/components/PropertySearch";
import ImovelCard from "@/components/ImovelCard";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, LayoutList } from "lucide-react";
import { imoveisService, Imovel, Imovel as ApiImovel } from "@/services/apiService";

// Tipos para as imagens da API
type ApiImageString = string;
type ApiImageObject = {
  original?: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  webp?: string;
  orientation?: "landscape" | "portrait" | "square" | "unknown";
  dimensions?: {
    width?: number;
    height?: number;
  };
};
type ApiImage = ApiImageString | ApiImageObject;

// Type guard para verificar se é um objeto de imagem
function isImageObject(img: ApiImage): img is ApiImageObject {
  return typeof img === 'object' && img !== null;
}

// Função para converter dados da API para o formato do componente
const convertApiToDisplay = (apiImovel: ApiImovel): Imovel => {
  // Função para gerar características baseadas na configuração
  const getCaracteristicas = (imovel: ApiImovel): string[] => {
    const caracteristicas = [];
    if (imovel.configuracaoPlanta.includes('Despensa')) caracteristicas.push('Despensa');
    if (imovel.configuracaoPlanta.includes('Dependência')) caracteristicas.push('Dependência de Empregada');
    if (imovel.tipoVagaGaragem === 'Coberta') caracteristicas.push('Garagem Coberta');
    if (imovel.numVagasGaragem && imovel.numVagasGaragem > 1) caracteristicas.push(`${imovel.numVagasGaragem} Vagas`);
    caracteristicas.push('Sacada', 'Área de Serviço');
    return caracteristicas;
  };

  return {
    _id: apiImovel._id,
    grupo: apiImovel.grupo,
    bloco: apiImovel.bloco,
    andar: apiImovel.andar,
    apartamento: apiImovel.apartamento,
    configuracaoPlanta: apiImovel.configuracaoPlanta,
    areaUtil: apiImovel.areaUtil,
    numVagasGaragem: apiImovel.numVagasGaragem,
    tipoVagaGaragem: apiImovel.tipoVagaGaragem,
    preco: apiImovel.preco,
    statusAnuncio: apiImovel.statusAnuncio,
    // endereco: apiImovel.endereco, // Propriedade não existe na interface Imovel
    caracteristicas: getCaracteristicas(apiImovel), // Gera características baseadas na configuração
    imagens: apiImovel.imagens ?
          (apiImovel.imagens as ApiImage[]).map((img) => {
            if (isImageObject(img)) {
              const result: {
                original: string;
                thumbnail?: string;
                medium?: string;
                large?: string;
                webp?: string;
                orientation?: "landscape" | "portrait" | "square" | "unknown";
                dimensions?: { width?: number; height?: number; };
              } = {
                original: img.original || img.medium || img.large || '/placeholder-image.jpg'
              };
              
              if (img.thumbnail) result.thumbnail = img.thumbnail;
              if (img.medium) result.medium = img.medium;
              if (img.large) result.large = img.large;
              if (img.webp) result.webp = img.webp;
              if (img.orientation) result.orientation = img.orientation;
              if (img.dimensions) result.dimensions = img.dimensions;
              
              return result;
            } else {
              return {
                original: img,
                thumbnail: img
              };
            }
          }) : [
            {
              original: '/placeholder-image.jpg',
              thumbnail: '/placeholder-image.jpg'
            }
          ],
    // descricao: `${apiImovel.configuracaoPlanta} com ${apiImovel.areaUtil}m² de área útil. ${apiImovel.numVagasGaragem || 0} vaga${(apiImovel.numVagasGaragem || 0) > 1 ? 's' : ''} de garagem ${apiImovel.tipoVagaGaragem?.toLowerCase() || 'não informada'}.`,
    destaque: apiImovel.destaque || Math.random() > 0.7
  };
};

const Imoveis = () => {
  const [visualizacao, setVisualizacao] = useState<"grid" | "lista">("grid");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar imóveis da API
  useEffect(() => {
    const loadImoveis = async () => {
      try {
        setLoading(true);
        const apiImoveis = await imoveisService.getAll();
        const displayImoveis = apiImoveis.map(convertApiToDisplay);
        setImoveis(displayImoveis);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar imóveis:', err);
        setError('Erro ao carregar imóveis. Usando dados de exemplo.');
        // Fallback para dados de exemplo em caso de erro
        setImoveis([
          {
            _id: "exemplo-1",
            grupo: 12,
            bloco: "A",
            andar: 10,
            apartamento: 101,
            configuracaoPlanta: "Padrão (2 dorms)",
            areaUtil: 82,
            numVagasGaragem: 1,
            tipoVagaGaragem: "Coberta",
            preco: 320000,
            statusAnuncio: "Disponível para Venda",
            // endereco removido pois não existe na interface Imovel
            caracteristicas: ["Garagem Coberta", "Sacada", "Área de Serviço"],
            imagens: [
              { original: "/placeholder-imovel.svg" },
              { original: "/placeholder-apartamento.svg" }
            ],
            // descricao removida pois não existe na interface Imovel
            destaque: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadImoveis();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header da página */}
      <div className="bg-imobiliaria-azul py-12">
        <div className="container-page">
          <h1 className="text-3xl font-bold text-white mb-4">Imóveis Disponíveis</h1>
          <p className="text-white/80 max-w-2xl">
            Encontre o imóvel ideal para você. Use os filtros abaixo para refinar sua busca.
          </p>
        </div>
      </div>
      
      {/* Filtros e resultados */}
      <div className="bg-gray-50 py-8">
        <div className="container-page">
          {/* Barra de filtro */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-gray-700 font-medium mr-2">
                {imoveis.length} imóveis encontrados
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <Filter size={16} className="mr-1" />
                Filtros
              </Button>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Visualização:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={visualizacao === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisualizacao("grid")}
                  className={visualizacao === "grid" ? "bg-imobiliaria-azul" : ""}
                >
                  <Grid3X3 size={16} className="mr-1" />
                  Grid
                </Button>
                <Button
                  variant={visualizacao === "lista" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisualizacao("lista")}
                  className={visualizacao === "lista" ? "bg-imobiliaria-azul" : ""}
                >
                  <LayoutList size={16} className="mr-1" />
                  Lista
                </Button>
              </div>
            </div>
          </div>
          
          {/* Filtros avançados */}
          {filtersVisible && (
            <div className="mb-6">
              <PropertySearch variant="vertical" />
            </div>
          )}
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-imobiliaria-azul"></div>
            </div>
          ) : (
            /* Resultados */
            visualizacao === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imoveis.map((imovel) => (
                  <ImovelCard key={imovel._id} imovel={imovel} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {imoveis.map((imovel) => (
                  <ImovelCard key={imovel._id} imovel={imovel} featured={true} />
                ))}
              </div>
            )
          )}

          {/* Mensagem quando não há imóveis */}
          {!loading && imoveis.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum imóvel encontrado.</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Imoveis;
