
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const ImovelDetalhe = () => {
  const { id } = useParams();
  const [imovel, setImovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você faria uma chamada à API real
    // Simulando dados para demonstração
    setTimeout(() => {
      setImovel({
        id,
        titulo: "Apartamento Moderno no Centro",
        endereco: "Av. Paulista, 1000, Apto 501",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        preco: 2500,
        area: 75,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        descricao: "Apartamento moderno e bem localizado no centro de São Paulo, próximo a estações de metrô e comércios locais. Ótima oportunidade para moradia ou investimento.",
        imagens: [
          "/placeholder.svg",
          "/placeholder.svg",
          "/placeholder.svg"
        ],
        caracteristicas: [
          "Portaria 24h",
          "Academia",
          "Piscina",
          "Churrasqueira",
          "Salão de Festas"
        ]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg">Carregando informações do imóvel...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="container-page py-8">
          <div className="mb-6">
            <Link to="/imoveis" className="flex items-center text-imobiliaria-azul hover:underline">
              <ArrowLeft className="mr-2" size={16} />
              Voltar para a lista de imóveis
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={imovel.imagens[0]} 
                    alt={imovel.titulo} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-imobiliaria-azul mb-2">{imovel.titulo}</h1>
                  <p className="text-gray-500 flex items-center mb-4">
                    <Home size={16} className="mr-1" />
                    {imovel.endereco}, {imovel.bairro}, {imovel.cidade}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-500 text-sm">Área</p>
                      <p className="font-medium">{imovel.area} m²</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-500 text-sm">Quartos</p>
                      <p className="font-medium">{imovel.quartos}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-500 text-sm">Banheiros</p>
                      <p className="font-medium">{imovel.banheiros}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-500 text-sm">Vagas</p>
                      <p className="font-medium">{imovel.vagas}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Descrição</h2>
                    <p className="text-gray-700">{imovel.descricao}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Características</h2>
                    <ul className="grid grid-cols-2 gap-2">
                      {imovel.caracteristicas.map((carac: string, index: number) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-imobiliaria-azul rounded-full mr-2"></span>
                          {carac}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Informações de Contato</h2>
                
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <p className="font-bold text-2xl text-imobiliaria-azul mb-1">
                    R$ {imovel.preco.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-gray-500">Aluguel mensal</p>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                    Agendar Visita
                  </Button>
                  
                  <Button variant="outline" className="w-full border-imobiliaria-azul text-imobiliaria-azul hover:bg-imobiliaria-azul/5">
                    <Phone size={16} className="mr-2" />
                    (11) 99999-9999
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ImovelDetalhe;
