
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Home as HomeIcon, FileText, Gavel } from "lucide-react";

const Index = () => {
  // Depoimentos de clientes
  const depoimentos = [
    {
      nome: "João Silva",
      cargo: "Proprietário",
      texto: "A Imobiliária Firenze cuidou do meu imóvel por 5 anos e nunca tive problemas. Administração impecável e atendimento personalizado."
    },
    {
      nome: "Maria Oliveira",
      cargo: "Inquilina",
      texto: "Processo de aluguel facilitado e transparente. A equipe está sempre disponível para resolver qualquer dúvida ou problema."
    },
    {
      nome: "Roberto Santos",
      cargo: "Investidor",
      texto: "Excelente assessoria para meus investimentos imobiliários. Análises precisas de mercado e orientação especializada."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Banner Principal */}
        <section className="bg-imobiliaria-azul text-white py-16">
          <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold">
                  Encontre o Imóvel Perfeito para seu Próximo Lar
                </h1>
                <p className="text-lg opacity-90 max-w-md">
                  A Firenze Imobiliária oferece as melhores opções de aluguel e venda em São Paulo, com atendimento personalizado e especializado.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/imoveis">
                    <Button className="bg-white text-imobiliaria-azul hover:bg-white/90">
                      Ver Imóveis
                    </Button>
                  </Link>
                  <Link to="/contato">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      Fale Conosco
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 p-2 rounded-lg shadow-xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Imóvel em destaque" 
                    className="w-full h-64 object-cover rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Serviços */}
        <section className="py-16 bg-white">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-imobiliaria-azul mb-4">
                Nossos Serviços
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Oferecemos soluções completas para locação, venda e administração de imóveis, 
                com atendimento personalizado e equipe experiente.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-all">
                <div className="bg-imobiliaria-azul/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HomeIcon size={32} className="text-imobiliaria-azul" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aluguel de Imóveis</h3>
                <p className="text-gray-600 mb-4">
                  Encontre o imóvel ideal para alugar com nossa seleção premium e processos simplificados.
                </p>
                <Link to="/imoveis" className="text-imobiliaria-azul font-medium hover:underline flex items-center justify-center">
                  Ver Imóveis <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-all">
                <div className="bg-imobiliaria-azul/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-imobiliaria-azul" />
                </div>
                <h3 className="text-xl font-bold mb-2">Administração de Contratos</h3>
                <p className="text-gray-600 mb-4">
                  Gerenciamos seus contratos com segurança, garantindo tranquilidade para proprietários e inquilinos.
                </p>
                <Link to="/sobre" className="text-imobiliaria-azul font-medium hover:underline flex items-center justify-center">
                  Saiba Mais <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-all">
                <div className="bg-imobiliaria-azul/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel size={32} className="text-imobiliaria-azul" />
                </div>
                <h3 className="text-xl font-bold mb-2">Assessoria Jurídica</h3>
                <p className="text-gray-600 mb-4">
                  Equipe jurídica especializada para garantir segurança e conformidade em todas as transações.
                </p>
                <Link to="/contato" className="text-imobiliaria-azul font-medium hover:underline flex items-center justify-center">
                  Consultar <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Área de Depoimentos */}
        <section className="py-16 bg-gray-50">
          <div className="container-page">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-imobiliaria-azul mb-4">
                O que Dizem Nossos Clientes
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                A satisfação de nossos clientes é nossa prioridade. Confira alguns depoimentos de pessoas que confiaram em nossos serviços.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {depoimentos.map((depoimento, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-imobiliaria-azul rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{depoimento.nome.charAt(0)}</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-bold">{depoimento.nome}</h4>
                      <p className="text-gray-500 text-sm">{depoimento.cargo}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{depoimento.texto}"</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Link to="/contato">
                <Button className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA - Área do Cliente */}
        <section className="bg-imobiliaria-dourado py-12">
          <div className="container-page">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-imobiliaria-azul mb-4">
                  Área do Cliente
                </h2>
                <p className="text-imobiliaria-azul/80 mb-6">
                  Acesse sua área exclusiva para visualizar contratos, boletos, recibos e 
                  todas as informações relacionadas ao seu imóvel.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/login">
                    <Button className="bg-imobiliaria-azul text-white hover:bg-imobiliaria-azul/90">
                      Acessar Área do Cliente
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="text-center md:text-right">
                <img 
                  src="/placeholder.svg" 
                  alt="Área do Cliente" 
                  className="inline-block w-64 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
