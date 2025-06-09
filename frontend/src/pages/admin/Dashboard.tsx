// Local: frontend/src/pages/admin/Dashboard.tsx (Seu código, agora corrigido)

import { useState, useEffect, useCallback } from "react"; // 1. IMPORTAR o useCallback
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  FileText,
  Users,
  BarChart3,
  DollarSign,
  Bell,
  Menu,
  X,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Mail
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { imoveisService } from "@/services/apiService";
import contratoService from "@/services/contratoService";

const Dashboard = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalImoveis: 0,
    contratosAtivos: 0,
    receitaMensal: 0,
    inadimplencia: 0,
    ocupacao: 0
  });
  
  const receitaData = [
    { mes: 'Jan', valor: 145000, meta: 150000 },
    { mes: 'Fev', valor: 158000, meta: 150000 },
    { mes: 'Mar', valor: 162000, meta: 160000 },
    { mes: 'Abr', valor: 175000, meta: 165000 },
    { mes: 'Mai', valor: 168000, meta: 170000 },
    { mes: 'Jun', valor: 182000, meta: 175000 },
  ];
  
  const ocupacaoData = [
    { nome: 'Ocupados', valor: 78, cor: '#10B981' },
    { nome: 'Disponíveis', valor: 22, cor: '#F59E0B' },
    { nome: 'Manutenção', valor: 5, cor: '#EF4444' },
    { nome: 'Reservados', valor: 8, cor: '#8B5CF6' },
  ];

  const tipoImovelData = [
    { categoria: 'Apartamentos', quantidade: 65, receita: 98000 },
    { categoria: 'Casas', quantidade: 23, receita: 67000 },
    { categoria: 'Comercial', quantidade: 18, receita: 54000 },
    { categoria: 'Sobrados', quantidade: 12, receita: 38000 },
  ];
  
  const alertas = [
    { 
      id: 1, 
      titulo: "5 contratos vencendo em 30 dias", 
      tipo: "warning", 
      data: "Hoje", 
      acao: "Verificar renovações",
      prioridade: "Alta"
    },
    { 
      id: 2, 
      titulo: "12 inquilinos em atraso", 
      tipo: "danger", 
      data: "Hoje", 
      acao: "Enviar cobranças",
      prioridade: "Urgente"
    },
    { 
      id: 3, 
      titulo: "3 imóveis precisam de vistoria", 
      tipo: "info", 
      data: "Esta semana", 
      acao: "Agendar vistorias",
      prioridade: "Média"
    },
    { 
      id: 4, 
      titulo: "Novo inquilino cadastrado", 
      tipo: "success", 
      data: "Ontem", 
      acao: "Processar documentos",
      prioridade: "Baixa"
    },
  ];

  const proximosVencimentos = [
    { contrato: "C-2024-001", inquilino: "João Silva", valor: 2500, data: "2024-07-05" },
    { contrato: "C-2024-023", inquilino: "Maria Santos", valor: 3200, data: "2024-07-08" },
    { contrato: "C-2024-045", inquilino: "Carlos Lima", valor: 1800, data: "2024-07-10" },
    { contrato: "C-2024-067", inquilino: "Ana Costa", valor: 4500, data: "2024-07-15" },
  ];

  const receitaPorCategoria = [
    { categoria: 'Aluguel', valor: 156000, percentual: 68 },
    { categoria: 'Condomínio', valor: 45000, percentual: 20 },
    { categoria: 'IPTU', valor: 18000, percentual: 8 },
    { categoria: 'Seguro', valor: 9000, percentual: 4 },
  ];

  // 2. ENVOLVER A SUA FUNÇÃO com useCallback
  const carregarDadosDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Carregar dados dos imóveis
      const imoveis = await imoveisService.getAll();
      const totalImoveis = imoveis.length;
      const imoveisOcupados = imoveis.filter(i => i.statusAnuncio === "Alugado").length;
      const ocupacao = totalImoveis > 0 ? Math.round((imoveisOcupados / totalImoveis) * 100) : 0;

      // Carregar dados dos contratos
      const contratos = await contratoService.getAll();
      const contratosAtivos = contratos.filter(c => c.status === "Ativo").length;
      
      // Calcular receita mensal (simulada)
      const receitaMensal = contratos
        .filter(c => c.status === "Ativo")
        .reduce((total, c) => total + c.valorAluguel, 0);

      // Calcular inadimplência (simulada - 8%)
      const inadimplencia = 8;

      setDashboardData({
        totalImoveis,
        contratosAtivos,
        receitaMensal,
        inadimplencia,
        ocupacao
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // A função 'toast' é a única dependência externa que precisa ser listada

  // 3. ATUALIZAR O useEffect
  useEffect(() => {
    carregarDadosDashboard();
  }, [carregarDadosDashboard]); // Agora a função está listada como dependência

  const enviarCobrancas = async () => {
    try {
      toast({
        title: "Enviando cobranças...",
        description: "As cobranças estão sendo enviadas para os inadimplentes",
      });

      // Simular envio de cobranças
      setTimeout(() => {
        toast({
          title: "Cobranças enviadas",
          description: "12 emails de cobrança enviados para financeiro@imobiliariafirenze.com.br",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao enviar cobranças",
        description: "Não foi possível enviar as cobranças",
        variant: "destructive",
      });
    }
  };

  const gerarRelatorio = () => {
    toast({
      title: "Gerando relatório",
      description: "O relatório mensal será enviado para adm@imobiliariafirenze.com.br",
    });
  };

  const cards = [
    { 
      title: "Total de Imóveis", 
      value: dashboardData.totalImoveis.toString(), 
      icon: Home, 
      color: "bg-blue-500",
      change: "+2.5%",
      trend: "up"
    },
    { 
      title: "Contratos Ativos", 
      value: dashboardData.contratosAtivos.toString(), 
      icon: FileText, 
      color: "bg-green-500",
      change: "+5.2%",
      trend: "up"
    },
    { 
      title: "Taxa de Ocupação", 
      value: `${dashboardData.ocupacao}%`, 
      icon: BarChart3, 
      color: "bg-amber-500",
      change: "+1.8%",
      trend: "up"
    },
    { 
      title: "Receita Mensal", 
      value: `R$ ${dashboardData.receitaMensal.toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-purple-500",
      change: "+8.3%",
      trend: "up"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-imobiliaria-azul mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <AdminSidebar />
      </div>
      
      {/* Menu móvel */}
      <div className="md:hidden">
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ease-in-out"
             style={{ display: mobileMenuOpen ? "block" : "none" }}
             onClick={() => setMobileMenuOpen(false)}
        />
        
        <div className={`fixed top-0 left-0 bottom-0 flex flex-col w-64 bg-imobiliaria-azul z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <AdminSidebar isMobile={true} setMobileOpen={setMobileMenuOpen} />
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="md:hidden mr-3 text-gray-600 hover:text-imobiliaria-azul"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Dashboard - Imobiliária Firenze</h1>
                <p className="text-sm text-gray-500">www.imobiliariafirenze.com.br</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={gerarRelatorio}
                className="flex items-center gap-2"
              >
                <BarChart3 size={16} />
                Relatório
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={enviarCobrancas}
                className="flex items-center gap-2"
              >
                <Mail size={16} />
                Cobranças
              </Button>
              
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {alertas.filter(alert => alert.prioridade === "Urgente" || alert.prioridade === "Alta").length}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {/* Cards informativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <div className="flex items-center mt-1">
                        <TrendingUp size={14} className="text-green-500 mr-1" />
                        <span className="text-sm text-green-500">{card.change}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${card.color}`}>
                      <card.icon size={24} className="text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alertas importantes */}
          {dashboardData.inadimplencia > 5 && (
            <div className="mb-6">
              <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle size={20} className="text-red-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-800">Atenção: Alta Taxa de Inadimplência</h3>
                      <p className="text-sm text-red-600">
                        Taxa atual: {dashboardData.inadimplencia}% - Recomendamos ação imediata de cobrança
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto bg-red-600 hover:bg-red-700"
                      onClick={enviarCobrancas}
                    >
                      Enviar Cobranças
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Gráficos principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Receita vs Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 size={20} className="mr-2 text-imobiliaria-azul" />
                  Receita vs Meta Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={receitaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, '']} />
                      <Line type="monotone" dataKey="valor" stroke="#1A365D" strokeWidth={3} name="Receita" />
                      <Line type="monotone" dataKey="meta" stroke="#C69C6D" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Gráfico de Ocupação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home size={20} className="mr-2 text-imobiliaria-azul" />
                  Distribuição de Ocupação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ocupacaoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="valor"
                        label={({nome, valor}) => `${nome}: ${valor}%`}
                      >
                        {ocupacaoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos secundários */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Receita por Tipo de Imóvel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign size={20} className="mr-2 text-imobiliaria-azul" />
                  Receita por Tipo de Imóvel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tipoImovelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Receita']} />
                      <Bar dataKey="receita" fill="#C69C6D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Receita por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 size={20} className="mr-2 text-imobiliaria-azul" />
                  Receita por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receitaPorCategoria.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-imobiliaria-azul mr-2" style={{
                          backgroundColor: ['#1A365D', '#C69C6D', '#10B981', '#F59E0B'][index]
                        }}></div>
                        <span className="text-sm font-medium">{item.categoria}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">R$ {item.valor.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{item.percentual}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Alertas e próximos vencimentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Alertas importantes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <AlertTriangle size={20} className="mr-2 text-imobiliaria-azul" />
                  Alertas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className={`p-3 rounded-md border-l-4 ${
                        alerta.tipo === "danger" ? "bg-red-50 border-l-red-500" :
                        alerta.tipo === "warning" ? "bg-yellow-50 border-l-yellow-500" :
                        alerta.tipo === "success" ? "bg-green-50 border-l-green-500" :
                        "bg-blue-50 border-l-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{alerta.titulo}</p>
                          <p className="text-xs text-gray-600 mt-1">{alerta.acao}</p>
                          <div className="flex items-center mt-2">
                            <Badge 
                              className={
                                alerta.prioridade === "Urgente" ? "bg-red-100 text-red-800" :
                                alerta.prioridade === "Alta" ? "bg-orange-100 text-orange-800" :
                                alerta.prioridade === "Média" ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                              }
                            >
                              {alerta.prioridade}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">{alerta.data}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Próximos vencimentos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Calendar size={20} className="mr-2 text-imobiliaria-azul" />
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proximosVencimentos.map((vencimento, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-sm">{vencimento.contrato}</p>
                        <p className="text-xs text-gray-600">{vencimento.inquilino}</p>
                        <p className="text-xs text-gray-500">{new Date(vencimento.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          R$ {vencimento.valor.toLocaleString()}
                        </p>
                        <Button size="sm" variant="outline" className="mt-1">
                          <Mail size={12} className="mr-1" />
                          Lembrete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/admin/contratos" className="text-imobiliaria-azul hover:text-imobiliaria-azul/80 text-sm font-medium">
                    Ver todos os contratos
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/admin/imoveis">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-2">
                    <Home size={20} />
                    <span className="text-xs">Novo Imóvel</span>
                  </Button>
                </Link>
                
                <Link to="/admin/contratos">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-2">
                    <FileText size={20} />
                    <span className="text-xs">Novo Contrato</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex flex-col items-center gap-2"
                  onClick={enviarCobrancas}
                >
                  <Mail size={20} />
                  <span className="text-xs">Enviar Cobranças</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-16 flex flex-col items-center gap-2"
                  onClick={gerarRelatorio}
                >
                  <BarChart3 size={20} />
                  <span className="text-xs">Relatório</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;