// Local: frontend/src/pages/ImovelDetalhe.tsx (Corrigido)

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { imoveisService, Imovel } from '@/services/apiService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Car, Ruler, Building, Calendar, Tag, MapPin, Phone, MessageSquare, Building2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { buildImageUrls } from '@/utils/imageUtils';

// Componente para a galeria de imagens
const ImovelGaleria = ({ imagens, fotoPrincipal }: { imagens: string[]; fotoPrincipal?: number }) => {
  // Construir URLs completas das imagens
  const imagensComUrls = buildImageUrls(imagens);
  // Usar a foto principal se definida, senão usar a primeira imagem
  const imagemPrincipalInicial = imagensComUrls[fotoPrincipal || 0] || imagensComUrls[0];
  const [imagemPrincipal, setImagemPrincipal] = useState(imagemPrincipalInicial);

  return (
    <div>
      <img src={imagemPrincipal} alt="Foto principal do imóvel" className="w-full h-96 object-cover rounded-lg mb-4" />
      <div className="grid grid-cols-5 gap-2">
        {imagensComUrls.slice(0, 5).map((imagem, index) => (
          <img
            key={index}
            src={imagem}
            alt={`Foto ${index + 1} do imóvel`}
            className={`w-full h-24 object-cover rounded-md cursor-pointer transition-transform duration-200 hover:scale-105 ${imagem === imagemPrincipal ? 'ring-2 ring-imobiliaria-azul' : ''}`}
            onClick={() => setImagemPrincipal(imagem)}
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Listener para detectar e corrigir problemas de cliques bloqueados
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Verificar se o body tem pointer-events: none
      const bodyStyle = getComputedStyle(document.body);
      if (bodyStyle.pointerEvents === 'none') {
        console.log('🚨 CLIQUE BLOQUEADO DETECTADO na página de detalhes! Corrigindo automaticamente...');
        e.preventDefault();
        e.stopPropagation();
        
        // Corrigir imediatamente
        document.body.style.pointerEvents = 'auto';
        document.body.style.removeProperty('pointer-events');
        
        // Chamar função global de limpeza se disponível
        const cleanupFn = (window as Window & { emergencyCleanupAllOverlays?: () => void }).emergencyCleanupAllOverlays;
        if (typeof cleanupFn === 'function') {
          console.log('🧹 Chamando limpeza de emergência global da página de detalhes');
          cleanupFn();
        }
        
        // Tentar executar o clique novamente após correção
        setTimeout(() => {
          const target = e.target as HTMLElement;
          if (target && target.click) {
            console.log('🔄 Tentando clique novamente após correção na página de detalhes');
            target.click();
          }
        }, 50);
      }
    };

    // Adicionar listener com capture para interceptar antes de outros handlers
    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  useEffect(() => {
    const fetchImovel = async () => {
      if (!id) {
        setError("ID do imóvel não fornecido");
        setLoading(false);
        return;
      }
      
      // Verificar se o ID tem formato válido do MongoDB
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        setError("Este link não é válido. O imóvel que você está procurando pode ter sido removido ou o link pode estar incorreto.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await imoveisService.getById(id);
        setImovel(data);
      } catch (error: unknown) {
        console.error("Erro ao buscar detalhes do imóvel:", error);
        let errorMessage = "Não foi possível carregar os detalhes do imóvel.";
        
        // Verificar se é erro do Axios
        if (error instanceof Error) {
          // Se for um Error padrão (já tratado pelo handleApiError), usar a mensagem
          errorMessage = error.message;
        } else if (error && typeof error === 'object' && 'response' in error) {
          // Se for um AxiosError não tratado
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 404) {
            errorMessage = "Imóvel não encontrado. Este imóvel pode ter sido removido ou o link pode estar incorreto.";
          } else if (axiosError.response?.status && axiosError.response.status >= 500) {
            errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
          }
        }
        
        setError(errorMessage);
        toast({
          title: "Erro",
          description: errorMessage,
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex justify-center mb-4">
                <svg className="h-12 w-12 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-red-800 mb-2">Erro ao carregar detalhes</h1>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/imoveis'} 
                  className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90"
                >
                  Ver todos os imóveis
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  Tentar novamente
                </Button>
                <Button 
                  onClick={() => window.history.back()} 
                  variant="ghost" 
                  className="w-full text-gray-600 hover:bg-gray-50"
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!imovel) {
    return <div className="flex h-screen items-center justify-center"><p>Imóvel não encontrado.</p></div>;
  }

  const imagensImovel: string[] = imovel.imagens || [];

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Coluna da Galeria */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {imovel.grupo} - Bloco {imovel.bloco}, Apto {imovel.apartamento}
              </h1>
              <p className="text-md text-gray-500 mb-6 flex items-center">
                <MapPin size={16} className="mr-2" />
                {imovel.andar}º andar - {imovel.configuracaoPlanta}
              </p>
              <ImovelGaleria imagens={imagensImovel} fotoPrincipal={imovel.fotoPrincipal} />
            </div>

            {/* Coluna de Informações e Contato */}
            <div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <p className="text-sm text-gray-600">Valor do Imóvel</p>
                <p className="text-4xl font-bold text-imobiliaria-azul mb-6">
                  R$ {imovel.preco?.toLocaleString('pt-BR')}
                </p>

                <div className="space-y-4 text-gray-700">
                    <div className="flex items-center"><Ruler size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.areaUtil} m²</span></div>
                    <div className="flex items-center"><Car size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.numVagasGaragem} vaga(s)</span></div>
                    <div className="flex items-center"><Building size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.tipoVagaGaragem}</span></div>
                    <div className="flex items-center"><Tag size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.statusAnuncio}</span></div>
                    <div className="flex items-center"><Calendar size={20} className="mr-3 text-imobiliaria-dourado" /><span>{imovel.andar}º andar</span></div>
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
          
          {/* Informações Detalhadas */}
          <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-4">Informações do Imóvel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-2"><strong>Grupo:</strong> {imovel.grupo}</p>
                  <p className="text-gray-700 mb-2"><strong>Bloco:</strong> {imovel.bloco}</p>
                  <p className="text-gray-700 mb-2"><strong>Andar:</strong> {imovel.andar}º</p>
                  <p className="text-gray-700 mb-2"><strong>Apartamento:</strong> {imovel.apartamento}</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Configuração:</strong> {imovel.configuracaoPlanta}</p>
                  <p className="text-gray-700 mb-2"><strong>Área Útil:</strong> {imovel.areaUtil} m²</p>
                  <p className="text-gray-700 mb-2"><strong>Vagas:</strong> {imovel.numVagasGaragem}</p>
                  <p className="text-gray-700 mb-2"><strong>Tipo de Vaga:</strong> {imovel.tipoVagaGaragem}</p>
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