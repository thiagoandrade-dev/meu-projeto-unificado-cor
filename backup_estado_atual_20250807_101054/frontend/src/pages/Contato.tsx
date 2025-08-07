
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Globe } from "lucide-react";

const Contato = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Enviar dados para o endpoint de contato
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          destinatario: 'adm@imobiliariafirenze.com.br',
          origem: 'www.imobiliariafirenze.com.br',
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast({
          title: "Mensagem enviada com sucesso!",
          description: "Entraremos em contato o mais breve possível através do email adm@imobiliariafirenze.com.br",
          duration: 5000
        });
        
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          assunto: "",
          mensagem: ""
        });
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente ou entre em contato diretamente pelo email adm@imobiliariafirenze.com.br",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="container-page py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-imobiliaria-azul mb-4">
              Entre em Contato - Imobiliária Firenze
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estamos à disposição para atender você e responder todas as suas dúvidas.
              Preencha o formulário abaixo ou utilize um de nossos canais de atendimento especializados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Envie-nos uma mensagem</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="assunto">Assunto</Label>
                      <Input
                        id="assunto"
                        name="assunto"
                        placeholder="Do que se trata sua mensagem?"
                        value={formData.assunto}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      placeholder="Digite sua mensagem aqui..."
                      value={formData.mensagem}
                      onChange={handleChange}
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">Informações de Contato</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Globe size={20} className="text-imobiliaria-azul mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href="https://www.imobiliariafirenze.com.br" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-imobiliaria-azul hover:underline"
                      >
                        www.imobiliariafirenze.com.br
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail size={20} className="text-imobiliaria-azul mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Emails Especializados</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Administração:</strong>{" "}
                          <a href="mailto:adm@imobiliariafirenze.com.br" className="text-imobiliaria-azul hover:underline">
                            adm@imobiliariafirenze.com.br
                          </a>
                        </p>
                        <p>
                          <strong>Cadastros:</strong>{" "}
                          <a href="mailto:cadastro@imobiliariafirenze.com.br" className="text-imobiliaria-azul hover:underline">
                            cadastro@imobiliariafirenze.com.br
                          </a>
                        </p>
                        <p>
                          <strong>Documentação:</strong>{" "}
                          <a href="mailto:doc@imobiliariafirenze.com.br" className="text-imobiliaria-azul hover:underline">
                            doc@imobiliariafirenze.com.br
                          </a>
                        </p>
                        <p>
                          <strong>Financeiro:</strong>{" "}
                          <a href="mailto:financeiro@imobiliariafirenze.com.br" className="text-imobiliaria-azul hover:underline">
                            financeiro@imobiliariafirenze.com.br
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone size={20} className="text-imobiliaria-azul mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-gray-600">(11) 3000-0000</p>
                      <p className="text-gray-600">(11) 99999-9999 (WhatsApp)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin size={20} className="text-imobiliaria-azul mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-gray-600">Av. Paulista, 1000, sala 301</p>
                      <p className="text-gray-600">Bela Vista, São Paulo - SP</p>
                      <p className="text-gray-600">CEP: 01310-100</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock size={20} className="text-imobiliaria-azul mr-3 mt-1" />
                    <div>
                      <p className="font-medium">Horário de Funcionamento</p>
                      <p className="text-gray-600">Segunda à Sexta: 9h às 18h</p>
                      <p className="text-gray-600">Sábado: 9h às 13h</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Departamentos</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="font-medium text-blue-800">Cadastros e Locações</p>
                    <p className="text-blue-600">Para cadastrar imóveis e consultar disponibilidade</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="font-medium text-green-800">Financeiro</p>
                    <p className="text-green-600">Para cobranças, pagamentos e questões financeiras</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-md">
                    <p className="font-medium text-purple-800">Jurídico</p>
                    <p className="text-purple-600">Para documentação e questões contratuais</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-md">
                    <p className="font-medium text-orange-800">Administração</p>
                    <p className="text-orange-600">Para questões gerais e atendimento personalizado</p>
                  </div>
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

export default Contato;
