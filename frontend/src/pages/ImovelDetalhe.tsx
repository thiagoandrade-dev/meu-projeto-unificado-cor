import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Phone, BedDouble, Bath, CarFront, AreaChart } from "lucide-react"; // Ícones adicionados
import { Link } from "react-router-dom";
import { imoveisService, Imovel } from "@/services/apiService"; // Correção: Importar Imovel e service
import { useToast } from "@/hooks/use-toast"; // Importar useToast

const ImovelDetalhe = () => {
  const { id } = useParams<{ id: string }>(); // Tipar o id
  const [imovel, setImovel] = useState<Imovel | null>(null); // Correção: Usar tipo Imovel | null
  const [loading, setLoading] = useState(true);
  const { toast } = useToast(); // Inicializar toast

  useEffect(() => {
    if (!id) {
      console.error("ID do imóvel não encontrado na URL.");
      setLoading(false);
      // Opcional: redirecionar ou mostrar mensagem de erro
      return;
    }

    const fetchImovel = async () => {
      setLoading(true);
      try {
        const data = await imoveisService.getById(id);
        setImovel(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do imóvel:", error);
        toast({ // Usar toast para feedback
          title: "Erro ao carregar imóvel",
          description: error instanceof Error ? error.message : "Não foi possível carregar os detalhes deste imóvel.",
          variant: "destructive",
        });
        setImovel(null); // Limpar estado em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchImovel();
  }, [id, toast]); // Adicionar toast às dependências

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg">Carregando informações do imóvel...</p>
          {/* Adicionar um spinner seria ideal aqui */}
        </div>
        <Footer />
      </div>
    );
  }

  // Adicionado: Tratar caso onde o imóvel não foi encontrado após a busca
  if (!imovel) {
     return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-semibold text-destructive mb-4">Imóvel não encontrado</h2>
          <p className="text-gray-600 mb-6">Não foi possível carregar as informações do imóvel solicitado.</p>
          <Link to="/imoveis">
            <Button variant="outline">
              <ArrowLeft className="mr-2" size={16} />
              Voltar para a lista
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Renderização principal quando o imóvel é carregado
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
            {/* Coluna Principal (Imagens e Detalhes) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Imagem Principal */} 
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={imovel.imagens && imovel.imagens.length > 0 ? imovel.imagens[0] : "/placeholder.svg"} // Usar placeholder se não houver imagem
                    alt={imovel.titulo || `Imóvel ${imovel.apartamento}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Conteúdo do Card */} 
                <div className="p-6">
                  {/* Título e Endereço */} 
                  <h1 className="text-2xl font-bold text-imobiliaria-azul mb-2">{imovel.titulo || `Apartamento ${imovel.apartamento}, Bloco ${imovel.bloco}`}</h1>
                  <p className="text-gray-500 flex items-center mb-4">
                    <Home size={16} className="mr-1" />
                    {/* Endereço formatado (ajustar conforme necessário) */} 
                    {`Apto ${imovel.apartamento}, Bloco ${imovel.bloco}, ${imovel.andar}º andar`}
                  </p>
                  
                  {/* Grid de Informações Rápidas */} 
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <InfoCard icon={AreaChart} label="Área Útil" value={`${imovel.areaUtil} m²`} />
                    <InfoCard icon={BedDouble} label="Quartos" value={imovel.configuracaoPlanta || 'N/A'} /> {/* Ajustar se quartos for numérico */} 
                    <InfoCard icon={Bath} label="Banheiros" value={'1'} /> {/* Assumindo 1 banheiro, ajustar se tiver no modelo */} 
                    <InfoCard icon={CarFront} label="Vagas" value={`${imovel.numVagasGaragem} (${imovel.tipoVagaGaragem})`} />
                  </div>
                  
                  {/* Descrição */} 
                  {imovel.descricao && (
                    <div className="mb-6">
                      <h2 className="text-lg font-medium mb-3">Descrição</h2>
                      <p className="text-gray-700 whitespace-pre-wrap">{imovel.descricao}</p>
                    </div>
                  )}
                  
                  {/* Características */} 
                  {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-medium mb-3">Características</h2>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Correção: Usar tipo string para carac */} 
                        {imovel.caracteristicas.map((carac: string, index: number) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-imobiliaria-azul rounded-full mr-2 flex-shrink-0"></span>
                            {carac}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Coluna Lateral (Contato e Preço) */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Informações de Contato</h2>
                
                {/* Preço */} 
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <p className="font-bold text-2xl text-imobiliaria-azul mb-1">
                    R$ {imovel.preco.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-gray-500">Aluguel mensal</p>
                </div>
                
                {/* Botões de Ação */} 
                <div className="space-y-4">
                  <Button className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                    Agendar Visita
                  </Button>
                  
                  <Button variant="outline" className="w-full border-imobiliaria-azul text-imobiliaria-azul hover:bg-imobiliaria-azul/5">
                    <Phone size={16} className="mr-2" />
                    Entrar em Contato
                  </Button>
                  {/* Adicionar link para WhatsApp se necessário */}
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

// Componente auxiliar para os cards de informação rápida
interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 p-3 rounded-md flex items-center gap-2">
    <Icon size={18} className="text-gray-500 flex-shrink-0" />
    <div>
      <p className="text-gray-500 text-xs leading-tight">{label}</p>
      <p className="font-medium text-sm leading-tight">{value}</p>
    </div>
  </div>
);

export default ImovelDetalhe;
