import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Home, Receipt, Bell, Download, Calendar, CreditCard, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import asaasService, { Boleto, Contrato } from "@/services/asaasService";

const AreaLocatario = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  
  // Redirecionar se não estiver logado
  if (!user) {
    navigate("/login");
    return null;
  }
  
  // Buscar boletos e contratos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Em um caso real, usaríamos o ID real do usuário
        const clienteId = "cus_000005113026";
        const boletosData = await asaasService.getBoletos(clienteId);
        const contratosData = await asaasService.getContratos(clienteId);
        
        setBoletos(boletosData);
        setContratos(contratosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus boletos e contratos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Dados fictícios de um inquilino
  const contratoAtual = {
    id: "C-2023-0125",
    endereco: "Av. Paulista, 1000, Apto. 501",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    dataInicio: "15/01/2023",
    dataFim: "14/01/2024",
    valor: 2500,
    status: "Ativo"
  };
  
  const notificacoes = [
    { id: 1, titulo: "Reajuste anual", mensagem: "Seu contrato terá reajuste a partir do próximo mês", data: "Hoje", lida: false },
    { id: 2, titulo: "Recibo disponível", mensagem: "O recibo do mês de Maio está disponível", data: "01/06/2023", lida: true },
    { id: 3, titulo: "Vistoria agendada", mensagem: "Uma vistoria foi agendada para o dia 15/07", data: "28/05/2023", lida: true },
  ];
  
  // Função para baixar boleto
  const handleDownloadBoleto = async (boleto: Boleto) => {
    try {
      toast({
        title: "Boleto em processamento",
        description: "Estamos gerando o seu boleto para download",
      });
      
      // Em uma implementação real, faríamos o download do PDF
      // Por enquanto, apenas simulamos o processo
      setTimeout(() => {
        toast({
          title: "Boleto pronto!",
          description: `Boleto #${boleto.invoiceNumber} disponível para download`,
        });
        
        // Simular download (em produção, usaríamos a URL real do boleto)
        const link = document.createElement('a');
        link.href = boleto.bankSlipUrl !== '#' ? 
          boleto.bankSlipUrl : 
          'https://sandbox.asaas.com/api/v3/payments/{boleto.id}/bankSlipBarCode';
        link.target = '_blank';
        link.click();
      }, 1500);
    } catch (error) {
      console.error("Erro ao baixar boleto:", error);
      toast({
        title: "Erro ao baixar boleto",
        description: "Não foi possível baixar o boleto selecionado",
        variant: "destructive",
      });
    }
  };
  
  // Função para baixar contrato
  const handleDownloadContrato = async (contrato: Contrato) => {
    try {
      toast({
        title: "Contrato em processamento",
        description: "Estamos preparando seu contrato para download",
      });
      
      // Em uma implementação real, faríamos o download do PDF
      // Por enquanto, apenas simulamos o processo
      setTimeout(() => {
        toast({
          title: "Contrato pronto!",
          description: `Contrato ${contrato.titulo} disponível para download`,
        });
        
        // Simular download
        const link = document.createElement('a');
        link.href = contrato.arquivo;
        link.target = '_blank';
        link.download = `${contrato.titulo.replace(/ /g, '_')}.pdf`;
        link.click();
      }, 1500);
    } catch (error) {
      console.error("Erro ao baixar contrato:", error);
      toast({
        title: "Erro ao baixar contrato",
        description: "Não foi possível baixar o contrato selecionado",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="container-page py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Olá, {user.nome}</h1>
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {notificacoes.filter(n => !n.lida).length}
                </span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="contrato" className="space-y-6">
            <TabsList className="w-full bg-white p-1 rounded shadow-sm border">
              <TabsTrigger value="contrato" className="flex items-center gap-2">
                <FileText size={16} />
                <span className="hidden md:inline">Contrato</span>
              </TabsTrigger>
              <TabsTrigger value="pagamentos" className="flex items-center gap-2">
                <CreditCard size={16} />
                <span className="hidden md:inline">Pagamentos</span>
              </TabsTrigger>
              <TabsTrigger value="documentos" className="flex items-center gap-2">
                <FileIcon size={16} />
                <span className="hidden md:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                <Bell size={16} />
                <span className="hidden md:inline">Notificações</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Aba de Contrato */}
            <TabsContent value="contrato">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText size={20} className="text-imobiliaria-azul" />
                        Seu Contrato Atual
                      </CardTitle>
                      <CardDescription>
                        Detalhes do seu contrato de locação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Contrato Nº:</span>
                          <span className="font-semibold">{contratoAtual.id}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Endereço:</span>
                          <span className="font-semibold">{contratoAtual.endereco}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Bairro:</span>
                          <span>{contratoAtual.bairro}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Cidade:</span>
                          <span>{contratoAtual.cidade}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Data de Início:</span>
                          <span>{contratoAtual.dataInicio}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Data de Término:</span>
                          <span>{contratoAtual.dataFim}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <span className="text-gray-500">Valor do Aluguel:</span>
                          <span className="font-semibold">
                            {contratoAtual.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Status:</span>
                          <Badge className="bg-green-500">{contratoAtual.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} className="text-imobiliaria-azul" />
                        Próximos Eventos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-yellow-600" />
                            <span className="text-sm font-medium">05/07/2023</span>
                          </div>
                          <p className="text-sm">Vencimento do aluguel</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="text-sm font-medium">15/07/2023</span>
                          </div>
                          <p className="text-sm">Vistoria agendada</p>
                        </div>
                        
                        <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-purple-600" />
                            <span className="text-sm font-medium">14/01/2024</span>
                          </div>
                          <p className="text-sm">Vencimento do contrato</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Aba de Pagamentos */}
            <TabsContent value="pagamentos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt size={20} className="text-imobiliaria-azul" />
                    Boletos e Pagamentos
                  </CardTitle>
                  <CardDescription>
                    Acompanhe seus boletos e baixe para pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <p>Carregando seus boletos...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-2 font-medium text-gray-500">Descrição</th>
                            <th className="pb-2 font-medium text-gray-500">Valor</th>
                            <th className="pb-2 font-medium text-gray-500">Vencimento</th>
                            <th className="pb-2 font-medium text-gray-500">Status</th>
                            <th className="pb-2 font-medium text-gray-500">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boletos.map((boleto) => (
                            <tr key={boleto.id} className="border-b">
                              <td className="py-4">{boleto.description}</td>
                              <td className="py-4">
                                {boleto.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                              <td className="py-4">{new Date(boleto.dueDate).toLocaleDateString('pt-BR')}</td>
                              <td className="py-4">
                                <Badge className={
                                  boleto.status === "RECEIVED" ? "bg-green-500" : 
                                  boleto.status === "PENDING" ? "bg-yellow-500" : "bg-gray-500"
                                }>
                                  {boleto.status === "RECEIVED" ? "Pago" : 
                                   boleto.status === "PENDING" ? "Pendente" : boleto.status}
                                </Badge>
                              </td>
                              <td className="py-4">
                                {boleto.status === "RECEIVED" ? (
                                  <Button variant="outline" size="sm" onClick={() => handleDownloadBoleto(boleto)}>
                                    <Download size={16} className="mr-1" />
                                    Recibo
                                  </Button>
                                ) : (
                                  <Button variant="default" size="sm" 
                                    className="bg-imobiliaria-dourado text-imobiliaria-azul hover:bg-imobiliaria-dourado/90"
                                    onClick={() => handleDownloadBoleto(boleto)}
                                  >
                                    <Download size={16} className="mr-1" />
                                    Boleto
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Aba de Documentos */}
            <TabsContent value="documentos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileIcon size={20} className="text-imobiliaria-azul" />
                    Contratos e Documentos
                  </CardTitle>
                  <CardDescription>
                    Acesse e baixe todos os seus documentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <p>Carregando seus documentos...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contratos.map((contrato) => (
                        <Card key={contrato.id} className="overflow-hidden">
                          <div className="bg-gray-100 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-imobiliaria-azul rounded-full p-2">
                                <FileText size={20} className="text-white" />
                              </div>
                              <div>
                                <h3 className="font-medium">{contrato.titulo}</h3>
                                <p className="text-sm text-gray-500">
                                  Data: {contrato.data}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadContrato(contrato)}
                              className="ml-2"
                            >
                              <Download size={16} className="mr-1" />
                              Baixar
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Aba de Notificações */}
            <TabsContent value="notificacoes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell size={20} className="text-imobiliaria-azul" />
                    Notificações
                  </CardTitle>
                  <CardDescription>
                    Avisos importantes da administração
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notificacoes.map((notificacao) => (
                      <div
                        key={notificacao.id}
                        className={`p-4 rounded-md border ${
                          notificacao.lida ? "bg-white" : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-medium ${!notificacao.lida ? "text-imobiliaria-azul" : ""}`}>
                            {notificacao.titulo}
                          </h3>
                          <span className="text-xs text-gray-500">{notificacao.data}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{notificacao.mensagem}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AreaLocatario;
