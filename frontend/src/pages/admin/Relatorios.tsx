import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSidebar from "@/components/AdminSidebar";
import { relatorioService, RelatorioResponse } from "@/services/relatorioService";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users,
  Calendar,
  BarChart3,
  PieChart,
  FileBarChart,
  Mail,
  Loader2
} from "lucide-react";

const Relatorios = () => {
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [relatorioGerado, setRelatorioGerado] = useState<RelatorioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Funções auxiliares para lidar com a estrutura de dados do relatório
  const getDataArray = (dados: RelatorioResponse['dados']): Record<string, unknown>[] => {
    if (Array.isArray(dados)) {
      return dados;
    }
    
    // Se dados é um objeto, procura por arrays dentro dele
    if (typeof dados === 'object' && dados !== null) {
      const keys = Object.keys(dados);
      for (const key of keys) {
        const value = dados[key as keyof typeof dados];
        if (Array.isArray(value)) {
          return value;
        }
      }
    }
    
    return [];
  };

  const getDataLength = (dados: RelatorioResponse['dados']): number => {
    return getDataArray(dados).length;
  };

  const getDataHeaders = (dados: RelatorioResponse['dados']): string[] => {
    const dataArray = getDataArray(dados);
    if (dataArray.length > 0) {
      return Object.keys(dataArray[0]);
    }
    return [];
  };

  const reportTypes = [
    { id: "financeiro", name: "Relatório Financeiro", icon: DollarSign, description: "Receitas, despesas e inadimplência" },
    { id: "imoveis", name: "Relatório de Imóveis", icon: Home, description: "Status e ocupação dos imóveis" },
    { id: "contratos", name: "Relatório de Contratos", icon: FileText, description: "Contratos ativos, vencidos e renovações" },
    { id: "inquilinos", name: "Relatório de Inquilinos", icon: Users, description: "Dados dos locatários" },
    { id: "juridico", name: "Relatório Jurídico", icon: FileBarChart, description: "Processos e questões legais" },
  ];

  const quickStats = [
    { title: "Receita Mensal", value: "R$ 45.230,00", change: "+12%", icon: DollarSign, color: "text-green-600" },
    { title: "Imóveis Ocupados", value: "87%", change: "+3%", icon: Home, color: "text-blue-600" },
    { title: "Contratos Ativos", value: "156", change: "+8", icon: FileText, color: "text-purple-600" },
    { title: "Taxa Inadimplência", value: "4.2%", change: "-1.3%", icon: TrendingUp, color: "text-orange-600" },
  ];

  const generateReport = async () => {
    if (!selectedType) {
      alert("Por favor, selecione um tipo de relatório");
      return;
    }

    if (!selectedPeriod) {
      alert("Por favor, selecione um período");
      return;
    }

    if (selectedPeriod === "custom" && (!dateRange.from || !dateRange.to)) {
      alert("Por favor, selecione as datas de início e fim para o período personalizado");
      return;
    }
    
    setLoading(true);
    try {
      const request: { periodo: string; dataInicio?: string; dataFim?: string } = {
        periodo: selectedPeriod,
      };
      
      if (selectedPeriod === "custom") {
        if (dateRange.from) request.dataInicio = dateRange.from;
        if (dateRange.to) request.dataFim = dateRange.to;
      }

      const relatorio = await relatorioService.gerarRelatorio(selectedType, request);
      setRelatorioGerado(relatorio);
      
      alert(`Relatório ${reportTypes.find(r => r.id === selectedType)?.name} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!relatorioGerado) {
      alert("Gere um relatório primeiro");
      return;
    }
    
    // Por enquanto, baixar como JSON até implementarmos geração de PDF
    relatorioService.downloadJSON(relatorioGerado);
  };

  const downloadCSV = () => {
    if (!relatorioGerado) {
      alert("Gere um relatório primeiro");
      return;
    }
    
    relatorioService.downloadCSV(relatorioGerado);
  };

  const enviarPorEmail = async () => {
    if (!relatorioGerado) {
      alert("Gere um relatório primeiro");
      return;
    }

    if (!emailDestino) {
      alert("Digite um email de destino");
      return;
    }

    setLoading(true);
    try {
      await relatorioService.enviarPorEmail({
        relatorio: relatorioGerado,
        email: emailDestino,
        assunto: `Relatório ${relatorioGerado.tipo} - ${new Date().toLocaleDateString()}`
      });
      
      alert("Relatório enviado por email com sucesso!");
      setShowEmailModal(false);
      setEmailDestino("");
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
              <p className="text-gray-600">Gere e visualize relatórios detalhados do sistema</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change} vs mês anterior
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="generate" className="space-y-6">
              <TabsList>
                <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-6">
                {/* Report Generation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Gerador de Relatórios
                    </CardTitle>
                    <CardDescription>
                      Selecione o tipo de relatório e período para gerar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Report Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reportTypes.map((type) => (
                        <Card 
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedType(type.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <type.icon className="h-6 w-6 text-blue-600 mt-1" />
                              <div>
                                <h3 className="font-semibold text-sm">{type.name}</h3>
                                <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Period Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Período Pré-definido</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current-month">Mês Atual</SelectItem>
                            <SelectItem value="last-month">Mês Anterior</SelectItem>
                            <SelectItem value="current-quarter">Trimestre Atual</SelectItem>
                            <SelectItem value="last-quarter">Trimestre Anterior</SelectItem>
                            <SelectItem value="current-year">Ano Atual</SelectItem>
                            <SelectItem value="last-year">Ano Anterior</SelectItem>
                            <SelectItem value="custom">Período Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedPeriod === "custom" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Período Personalizado</label>
                          <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    placeholder="Data inicial"
                  />
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    placeholder="Data final"
                  />
                </div>
                        </div>
                      )}
                    </div>

                    {/* Generate Button */}
                    <div className="flex gap-3 flex-wrap">
                      <Button 
                        onClick={generateReport} 
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {loading ? "Gerando..." : "Gerar Relatório"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={downloadPDF}
                        disabled={!relatorioGerado}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar JSON
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={downloadCSV}
                        disabled={!relatorioGerado}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar CSV
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setShowEmailModal(true)}
                        disabled={!relatorioGerado}
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Enviar por Email
                      </Button>
                    </div>
                    
                    {/* Relatório Gerado */}
                    {relatorioGerado && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Relatório Gerado</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Tipo</p>
                              <p className="font-medium">{relatorioGerado.tipo}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Período</p>
                              <p className="font-medium">{typeof relatorioGerado.periodo === 'object' ? `${relatorioGerado.periodo.inicio} - ${relatorioGerado.periodo.fim}` : relatorioGerado.periodo}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total de Registros</p>
                              <p className="font-medium">{getDataLength(relatorioGerado.dados)}</p>
                            </div>
                          </div>
                          
                          {getDataLength(relatorioGerado.dados) > 0 && (
                            <div className="max-h-64 overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    {getDataHeaders(relatorioGerado.dados).map((key) => (
                                      <th key={key} className="p-2 text-left">{key}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {getDataArray(relatorioGerado.dados).slice(0, 5).map((item: Record<string, unknown>, index: number) => (
                                    <tr key={index} className="border-b">
                                      {Object.values(item).map((value: unknown, i: number) => (
                                        <td key={i} className="p-2">{String(value ?? '')}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {getDataLength(relatorioGerado.dados) > 5 && (
                                <p className="text-center text-gray-500 mt-2">
                                  ... e mais {getDataLength(relatorioGerado.dados) - 5} registros
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics Dashboard
                    </CardTitle>
                    <CardDescription>
                      Visualizações e métricas em tempo real
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Gráfico de Ocupação</p>
                        </div>
                      </div>
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Receita Mensal</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Histórico de Relatórios
                    </CardTitle>
                    <CardDescription>
                      Relatórios gerados anteriormente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Relatório Financeiro - Novembro 2024", date: "01/12/2024", status: "Concluído" },
                        { name: "Relatório de Imóveis - Outubro 2024", date: "01/11/2024", status: "Concluído" },
                        { name: "Relatório de Contratos - Q3 2024", date: "01/10/2024", status: "Concluído" },
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-gray-600">Gerado em {report.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{report.status}</Badge>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Modal de Email */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Enviar Relatório por Email</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email de destino:</label>
                <Input
                  type="email"
                  value={emailDestino}
                  onChange={(e) => setEmailDestino(e.target.value)}
                  placeholder="exemplo@email.com"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailDestino('');
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={enviarPorEmail}
                  disabled={!emailDestino || loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Relatorios;