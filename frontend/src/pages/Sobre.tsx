
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building, Calendar, Users, Shield } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="container-page py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-imobiliaria-azul mb-4">
              Sobre a Imobiliária Firenze
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Há mais de 15 anos no mercado imobiliário, oferecendo soluções completas para locação, venda e administração de imóveis com excelência e profissionalismo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-imobiliaria-azul mb-6">Nossa História</h2>
              <p className="text-gray-700 mb-4">
                Fundada em 2008, a Imobiliária Firenze nasceu do sonho de oferecer um serviço diferenciado no mercado imobiliário da região. Começamos com uma pequena equipe de 3 corretores e hoje contamos com mais de 30 profissionais especializados.
              </p>
              <p className="text-gray-700 mb-4">
                Ao longo desses anos, conquistamos a confiança de centenas de clientes através de um trabalho sério, ético e transparente. Nossa missão sempre foi facilitar a realização do sonho da casa própria e oferecer soluções personalizadas para investidores e proprietários.
              </p>
              <p className="text-gray-700">
                Com uma visão inovadora e atenta às novas tecnologias, a Firenze se consolidou como referência no mercado imobiliário local, destacando-se pela excelência no atendimento e gestão eficiente de imóveis.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-imobiliaria-azul mb-6">Números que nos Orgulham</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <Calendar size={32} className="mx-auto mb-2 text-imobiliaria-azul" />
                  <p className="text-2xl font-bold text-imobiliaria-azul">15+</p>
                  <p className="text-gray-600">Anos de experiência</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <Building size={32} className="mx-auto mb-2 text-imobiliaria-azul" />
                  <p className="text-2xl font-bold text-imobiliaria-azul">500+</p>
                  <p className="text-gray-600">Imóveis administrados</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <Users size={32} className="mx-auto mb-2 text-imobiliaria-azul" />
                  <p className="text-2xl font-bold text-imobiliaria-azul">1000+</p>
                  <p className="text-gray-600">Clientes satisfeitos</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <Shield size={32} className="mx-auto mb-2 text-imobiliaria-azul" />
                  <p className="text-2xl font-bold text-imobiliaria-azul">100%</p>
                  <p className="text-gray-600">Comprometimento</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
            <h2 className="text-2xl font-bold text-imobiliaria-azul mb-6 text-center">Nossa Missão, Visão e Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-imobiliaria-azul rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">M</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Missão</h3>
                <p className="text-gray-700">
                  Oferecer soluções imobiliárias que atendam às necessidades dos nossos clientes, com excelência e segurança, contribuindo para a realização de seus sonhos.
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-imobiliaria-dourado rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-imobiliaria-azul text-2xl font-bold">V</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Visão</h3>
                <p className="text-gray-700">
                  Ser reconhecida como referência de qualidade e confiança no mercado imobiliário, expandindo nossa atuação e utilizando as melhores práticas e tecnologias.
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-imobiliaria-azul/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-imobiliaria-azul text-2xl font-bold">V</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Valores</h3>
                <p className="text-gray-700">
                  Ética, transparência, compromisso, inovação e excelência são os pilares que sustentam todas as nossas ações e relacionamentos.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-imobiliaria-azul mb-6">Venha nos Conhecer</h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Estamos prontos para atender você e oferecer as melhores soluções para suas necessidades imobiliárias. Nossa equipe está à disposição para tirar todas as suas dúvidas e oferecer um atendimento personalizado.
            </p>
            <div className="inline-flex justify-center">
              <a href="/contato" className="bg-imobiliaria-azul text-white px-6 py-3 rounded-md font-medium hover:bg-imobiliaria-azul/90 transition-colors">
                Entre em Contato
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Sobre;
