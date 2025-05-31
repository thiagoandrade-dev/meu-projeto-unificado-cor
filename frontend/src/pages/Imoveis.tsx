
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertySearch from "@/components/PropertySearch";
import ImovelCard, { Imovel } from "@/components/ImovelCard";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, LayoutList } from "lucide-react";

const Imoveis = () => {
  const [visualizacao, setVisualizacao] = useState<"grid" | "lista">("grid");
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Dados fictícios de imóveis
  const [imoveis] = useState<Imovel[]>([
    {
      id: "1",
      titulo: "Apartamento de luxo com vista para o mar",
      tipo: "Apartamento",
      operacao: "Venda",
      preco: 1250000,
      precoCondominio: 1200,
      endereco: "Av. Atlântica, 2000",
      bairro: "Copacabana",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      areaUtil: 120,
      quartos: 3,
      suites: 1,
      banheiros: 2,
      vagas: 2,
      descricao: "Lindo apartamento de frente para o mar com vista panorâmica, 3 quartos sendo 1 suíte, totalmente reformado e mobiliado.",
      caracteristicas: ["Mobiliado", "Armários embutidos", "Varanda gourmet", "Academia", "Piscina"],
      fotos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
      destaque: true
    },
    {
      id: "2",
      titulo: "Casa com piscina em condomínio fechado",
      tipo: "Casa",
      operacao: "Aluguel",
      preco: 5500,
      endereco: "Rua das Flores, 150",
      bairro: "Alphaville",
      cidade: "Barueri",
      estado: "SP",
      areaUtil: 250,
      quartos: 4,
      suites: 2,
      banheiros: 3,
      vagas: 4,
      descricao: "Casa ampla em condomínio fechado com segurança 24h, 4 quartos sendo 2 suítes, piscina privativa, churrasqueira e jardim.",
      caracteristicas: ["Condomínio fechado", "Segurança 24h", "Piscina", "Churrasqueira", "Jardim"],
      fotos: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914"],
      destaque: true
    },
    {
      id: "3",
      titulo: "Sala comercial no centro empresarial",
      tipo: "Comercial",
      operacao: "Aluguel",
      preco: 3800,
      precoCondominio: 800,
      endereco: "Av. Paulista, 1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      areaUtil: 60,
      descricao: "Sala comercial no principal centro empresarial da cidade, pronta para uso com divisórias, ar-condicionado central e 1 vaga de garagem.",
      caracteristicas: ["Pronta para uso", "Ar-condicionado", "1 vaga", "Recepção", "Segurança 24h"],
      fotos: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72"],
      destaque: true
    },
    {
      id: "4",
      titulo: "Apartamento mobiliado no centro",
      tipo: "Apartamento",
      operacao: "Aluguel",
      preco: 2800,
      precoCondominio: 650,
      endereco: "Rua Augusta, 500",
      bairro: "Consolação",
      cidade: "São Paulo",
      estado: "SP",
      areaUtil: 70,
      quartos: 2,
      banheiros: 1,
      vagas: 1,
      descricao: "Apartamento totalmente mobiliado no centro da cidade, próximo a restaurantes, comércios e transporte público.",
      caracteristicas: ["Mobiliado", "Prédio com elevador", "Portaria 24h"],
      fotos: ["https://images.unsplash.com/photo-1556912998-c57cc6b63cd7"],
      destaque: false
    },
    {
      id: "5",
      titulo: "Terreno para construção de alto padrão",
      tipo: "Terreno",
      operacao: "Venda",
      preco: 380000,
      endereco: "Rua dos Coqueiros, s/n",
      bairro: "Condomínio Green Valley",
      cidade: "Campinas",
      estado: "SP",
      areaUtil: 450,
      descricao: "Excelente terreno em condomínio fechado de alto padrão, pronto para construção, com infraestrutura completa.",
      caracteristicas: ["Condomínio fechado", "Infraestrutura completa", "Lazer completo"],
      fotos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef"],
      destaque: false
    },
    {
      id: "6",
      titulo: "Cobertura duplex com terraço",
      tipo: "Apartamento",
      operacao: "Venda",
      preco: 1800000,
      precoCondominio: 1500,
      endereco: "Av. Boa Viagem, 1500",
      bairro: "Boa Viagem",
      cidade: "Recife",
      estado: "PE",
      areaUtil: 180,
      quartos: 3,
      suites: 3,
      banheiros: 4,
      vagas: 3,
      descricao: "Cobertura duplex de alto padrão com vista para o mar, terraço com piscina e churrasqueira, 3 suítes e 3 vagas de garagem.",
      caracteristicas: ["Terraço", "Piscina privativa", "Churrasqueira", "Vista para o mar"],
      fotos: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750"],
      destaque: false
    },
  ]);
  
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
          
          {/* Resultados */}
          {visualizacao === "grid" ? (
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
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Imoveis;
