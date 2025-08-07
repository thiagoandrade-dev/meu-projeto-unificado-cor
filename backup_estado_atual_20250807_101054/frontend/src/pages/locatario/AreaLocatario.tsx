import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, Bell, Download, Calendar, CreditCard, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Importar Badge
import { useToast } from "@/hooks/use-toast";
import asaasService, { Boleto, Contrato } from "@/services/asaasService";

const AreaLocatario = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);

  useEffect(() => {
    if (!user) {
      toast({ title: "Acesso Negado", description: "Faça login para acessar esta área.", variant: "destructive" });
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const clienteId = "cus_000005113026"; // Substituir pelo ID real do usuário logado
        
        if (!clienteId) {
            throw new Error("ID do cliente não encontrado para buscar dados.");
        }

        const boletosData = await asaasService.getBoletos(clienteId);
        const contratosData = await asaasService.getContratos(clienteId);
        
        setBoletos(boletosData);
        setContratos(contratosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: error instanceof Error ? error.message : "Não foi possível carregar seus boletos e contratos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
  }, [user, navigate, toast]);

  // Dados fictícios (manter por enquanto)
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
  
  const handleDownloadBoleto = async (boleto: Boleto) => {
    try {
      toast({
        title: "Boleto em processamento",
        description: "Estamos gerando o seu boleto para download",
      });
      
      setTimeout(() => {
        toast({
          title: "Boleto pronto!",
          description: `Boleto #${boleto.invoiceNumber} disponível para download`,
        });
        
        const link = document.createElement("a");
        link.href = boleto.bankSlipUrl || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
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
  
  const handleDownloadContrato = async (contrato: Contrato) => {
    try {
      toast({
        title: "Contrato em processamento",
        description: "Estamos preparando seu contrato para download",
      });
      
      setTimeout(() => {
        toast({
          title: "Contrato pronto!",
          description: `Contrato ${contrato.titulo} disponível para download`,
        });
        
        const link = document.createElement("a");
        link.href = contrato.arquivo || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = `${contrato.titulo.replace(/ /g, "_")}.pdf`;
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

  if (!user) {
      return <div className="min-h-screen flex items-center justify-center">Verificando acesso...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="container-page py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Olá, {user?.nome || "Locatário"}</h1>
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
                            {contratoAtual.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Status:</span>
                          {/* Usar variante válida para o status do contrato */}
                          <Badge variant={contratoAtual.status === "Ativo" ? "default" : "secondary"}>{contratoAtual.status}</Badge>
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
                  ) : boletos.length === 0 ? (
                     <p className="text-center text-gray-500 py-8">Nenhum boleto encontrado.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="p-2 font-medium text-gray-500">Descrição</th>
                            <th className="p-2 font-medium text-gray-500">Valor</th>
                            <th className="p-2 font-medium text-gray-500">Vencimento</th>
                            <th className="p-2 font-medium text-gray-500">Status</th>
                            <th className="p-2 font-medium text-gray-500">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boletos.map((boleto) => (
                            <tr key={boleto.id} className="border-b hover:bg-gray-100">
                              <td className="p-2">{boleto.description}</td>
                              <td className="p-2">
                                {boleto.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </td>
                              <td className="p-2">{new Date(boleto.dueDate).toLocaleDateString("pt-BR")}</td>
                              <td className="p-2">
                                {/* Correção: Mapear status para variantes válidas do Badge */}
                                <Badge variant={ 
                                  boleto.status === "RECEIVED" ? "default" : // Usar default para 'pago' (geralmente verde)
                                  boleto.status === "PENDING" ? "secondary" : // Usar secondary para 'pendente' (geralmente cinza/amarelo)
                                  "secondary" // Usar secondary para outros status
                                }>
                                  {boleto.status === "RECEIVED" ? "Pago" : 
                                   boleto.status === "PENDING" ? "Pendente" : boleto.status}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Button 
                                  variant={boleto.status === "RECEIVED" ? "outline" : "default"} 
                                  size="sm" 
                                  onClick={() => handleDownloadBoleto(boleto)}
                                  className={boleto.status !== "RECEIVED" ? "bg-imobiliaria-dourado text-imobiliaria-azul hover:bg-imobiliaria-dourado/90" : ""}
                                >
                                  <Download size={16} className="mr-1" />
                                  {boleto.status === "RECEIVED" ? "Recibo" : "Boleto"}
                                </Button>
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
                    Documentos Importantes
                  </CardTitle>
                  <CardDescription>
                    Acesse cópias do seu contrato e outros documentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                 {loading ? (
                    <div className="flex justify-center py-8">
                      <p>Carregando seus documentos...</p>
                    </div>
                  ) : contratos.length === 0 ? (
                     <p className="text-center text-gray-500 py-8">Nenhum documento encontrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {contratos.map((contrato) => (
                        <div key={contrato.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-100">
                          <div className="flex items-center gap-3">
                            <FileIcon size={18} className="text-gray-500" />
                            <span>{contrato.titulo}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadContrato(contrato)}>
                            <Download size={16} className="mr-1" />
                            Baixar
                          </Button>
                        </div>
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
                    Avisos e comunicados importantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notificacoes.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhuma notificação no momento.</p>
                  ) : (
                    <div className="space-y-4">
                      {notificacoes.map((notificacao) => (
                        <div key={notificacao.id} className={`p-4 border rounded-md ${notificacao.lida ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-semibold ${notificacao.lida ? 'text-gray-700' : 'text-blue-800'}`}>{notificacao.titulo}</span>
                            <span className="text-xs text-gray-500">{notificacao.data}</span>
                          </div>
                          <p className={`text-sm ${notificacao.lida ? 'text-gray-600' : 'text-blue-700'}`}>{notificacao.mensagem}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
