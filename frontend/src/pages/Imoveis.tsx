
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertySearch from "@/components/PropertySearch";
import ImovelCard, { Imovel } from "@/components/ImovelCard";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, LayoutList } from "lucide-react";
import { imoveisService, Imovel as ApiImovel } from "@/services/apiService";

// Função para converter dados da API para o formato do componente
const convertApiToDisplay = (apiImovel: ApiImovel): Imovel => {
  // Determinar o número de quartos baseado na configuração da planta
  const getQuartosFromConfig = (config: string): number => {
    if (config.includes('2 dorms')) return 2;
    if (config.includes('3 dorms')) return 3;
    return 2; // padrão
  };

  // Gerar características baseadas na configuração
  const getCaracteristicas = (imovel: ApiImovel): string[] => {
    const caracteristicas = [];
    if (imovel.configuracaoPlanta.includes('Despensa')) caracteristicas.push('Despensa');
    if (imovel.configuracaoPlanta.includes('Dependência')) caracteristicas.push('Dependência de Empregada');
    if (imovel.tipoVagaGaragem === 'Coberta') caracteristicas.push('Garagem Coberta');
    if (imovel.numVagasGaragem > 1) caracteristicas.push(`${imovel.numVagasGaragem} Vagas`);
    caracteristicas.push('Sacada', 'Área de Serviço');
    return caracteristicas;
  };

  return {
    id: apiImovel._id,
    titulo: `Apartamento ${apiImovel.configuracaoPlanta} - Grupo ${apiImovel.grupo}`,
    tipo: "Apartamento",
    operacao: apiImovel.statusAnuncio.includes('Venda') ? "Venda" : "Aluguel",
    preco: apiImovel.preco,
    precoCondominio: 350, // Valor padrão para condomínio
    endereco: `Bloco ${apiImovel.bloco}, Andar ${apiImovel.andar}, Apt ${apiImovel.apartamento}`,
    bairro: "Residencial Firenze",
    cidade: "São Paulo",
    estado: "SP",
    areaUtil: apiImovel.areaUtil,
    quartos: getQuartosFromConfig(apiImovel.configuracaoPlanta),
    suites: apiImovel.configuracaoPlanta.includes('3 dorms') ? 1 : 0,
    banheiros: apiImovel.configuracaoPlanta.includes('3 dorms') ? 2 : 1,
    vagas: apiImovel.numVagasGaragem,
    descricao: `${apiImovel.configuracaoPlanta} com ${apiImovel.areaUtil}m² de área útil. ${apiImovel.numVagasGaragem} vaga${apiImovel.numVagasGaragem > 1 ? 's' : ''} de garagem ${apiImovel.tipoVagaGaragem.toLowerCase()}.`,
    caracteristicas: getCaracteristicas(apiImovel),
    fotos: [
      "/placeholder-imovel.svg",
      "/placeholder-apartamento.svg"
    ],
    destaque: Math.random() > 0.7, // Alguns imóveis aleatórios como destaque
    grupo: `Grupo ${apiImovel.grupo}`,
    // Campos específicos do backend preservados
    _id: apiImovel._id,
    bloco: apiImovel.bloco,
    apartamento: apiImovel.apartamento,
    andar: apiImovel.andar,
    configuracaoPlanta: apiImovel.configuracaoPlanta,
    statusAnuncio: apiImovel.statusAnuncio,
    tipoVagaGaragem: apiImovel.tipoVagaGaragem,
    numVagasGaragem: apiImovel.numVagasGaragem,
    torre: apiImovel.torre || null
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
            id: "exemplo-1",
            titulo: "Apartamento Padrão (2 dorms) - Grupo 12",
            tipo: "Apartamento",
            operacao: "Venda",
            preco: 320000,
            precoCondominio: 350,
            endereco: "Bloco A, Andar 10, Apt 101",
            bairro: "Residencial Firenze",
            cidade: "São Paulo",
            estado: "SP",
            areaUtil: 82,
            quartos: 2,
            suites: 0,
            banheiros: 1,
            vagas: 1,
            descricao: "Apartamento padrão com 2 dormitórios e 82m² de área útil. 1 vaga de garagem coberta.",
            caracteristicas: ["Garagem Coberta", "Sacada", "Área de Serviço"],
            fotos: [
              "/placeholder-imovel.svg",
              "/placeholder-apartamento.svg"
            ],
            destaque: true,
            grupo: "Grupo 12",
            _id: "exemplo-1",
            bloco: "A",
            apartamento: 101,
            andar: 10,
            configuracaoPlanta: "Padrão (2 dorms)",
            statusAnuncio: "Disponível para Venda",
            tipoVagaGaragem: "Coberta",
            numVagasGaragem: 1,
            torre: null
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
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {imoveis.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} featured={true} />
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
