// Local: frontend/src/pages/ImovelDetalhe.tsx (Corrigido)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { imoveisService, Imovel } from '@/services/apiService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BedDouble, Bath, Car, Ruler, Building, Calendar, Tag, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Componente para a galeria de imagens
const ImovelGaleria = ({ fotos }: { fotos: string[] }) => {
  const [fotoPrincipal, setFotoPrincipal] = useState(fotos[0] || '');

  if (!fotos || fotos.length === 0) {
    return <div className="bg-gray-200 h-96 flex items-center justify-center rounded-lg"><p>Sem imagens disponíveis</p></div>;
  }

  return (
    <div>
      <img src={fotoPrincipal} alt="Foto principal do imóvel" className="w-full h-96 object-cover rounded-lg mb-4" />
      <div className="grid grid-cols-5 gap-2">
        {fotos.slice(0, 5).map((foto, index) => (
          <img
            key={index}
            src={foto}
            alt={`Foto ${index + 1} do imóvel`}
            className={`w-full h-24 object-cover rounded-md cursor-pointer transition-transform duration-200 hover:scale-105 ${foto === fotoPrincipal ? 'ring-2 ring-imobiliaria-azul' : ''}`}
            onClick={() => setFotoPrincipal(foto)}
          />
        ))}
      </div>
    </div>
  );
};

const ImovelDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchImovel = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await imoveisService.getById(id);
        setImovel(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do imóvel:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do imóvel.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchImovel();
  }, [id, toast]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p>Carregando detalhes do imóvel...</p></div>;
  }

  if (!imovel) {
    return <div className="flex h-screen items-center justify-center"><p>Imóvel não encontrado.</p></div>;
  }

  // CORREÇÃO APLICADA: Usando 'fotos' em vez de 'imagens'
  const fotosImovel = imovel.fotos && imovel.fotos.length > 0 ? imovel.fotos : [];

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Coluna da Galeria */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{imovel.titulo}</h1>
               {/* CORREÇÃO APLICADA: Usando os campos corretos da interface */}
              <p className="text-md text-gray-500 mb-6 flex items-center">
                <MapPin size={16} className="mr-2" />
                {imovel.endereco}, {imovel.cidade} - {imovel.uf}
              </p>
              <ImovelGaleria fotos={fotosImovel} />
            </div>

            {/* Coluna de Informações e Contato */}
            <div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600">Valor do Aluguel</p>
                {/* CORREÇÃO APLICADA: Usando 'valor' em vez de 'preco' */}
                <p className="text-4xl font-bold text-imobiliaria-azul mb-6">
                  {imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  <span className="text-lg font-normal text-gray-500">/mês</span>
                </p>

                <div className="space-y-4 text-gray-700">
                    <div className="flex items-center"><Ruler size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.area} m² de área</span></div>
                    <div className="flex items-center"><BedDouble size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.quartos} quartos</span></div>
                    <div className="flex items-center"><Bath size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.banheiros} banheiros</span></div>
                    <div className="flex items-center"><Car size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.vagasGaragem} vaga(s) de garagem</span></div>
                    <div className="flex items-center"><Building size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.andar ? `${imovel.andar}º andar` : 'Térreo'}</span></div>
                </div>

                 <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Fale com um corretor</h3>
                    <Button className="w-full mb-3 bg-green-500 hover:bg-green-600 flex items-center gap-2">
                        <MessageSquare size={18} /> Iniciar chat via WhatsApp
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                        <Phone size={18} /> Ligar para (11) 99999-9999
                    </Button>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Descrição e Características */}
          <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-4">Descrição</h2>
              <p className="text-gray-600 leading-relaxed">{imovel.descricao}</p>

              {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Características</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imovel.caracteristicas.map((item, index) => (
                            <div key={index} className="bg-gray-100 p-3 rounded-md flex items-center">
                                <Tag size={16} className="mr-3 text-imobiliaria-dourado"/>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
              )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ImovelDetalhe;