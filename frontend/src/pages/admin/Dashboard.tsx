// frontend/src/pages/admin/Dashboard.tsx
import { useState, useEffect, useCallback } from "react";
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
  TrendingDown,
  Calendar,
  Mail,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import dashboardService, { DashboardCompleto } from "@/services/dashboardService";

const Dashboard = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardCompleto | null>(null);

  // Função para carregar os dados do dashboard, com useCallback para evitar warning do ESLint
  const carregarDadosDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardCompleto();
      setDashboardData(data);
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
  }, [toast]);

  // Carregar dados ao montar o componente e quando carregarDadosDashboard mudar
  useEffect(() => {
    carregarDadosDashboard();
  }, [carregarDadosDashboard]);

  // Função para atualizar os dados do dashboard
  const atualizarDados = async () => {
    try {
      setRefreshing(true);
      const data = await dashboardService.getDashboardCompleto();
      setDashboardData(data);
      toast({
        title: "Dados atualizados",
        description: "Os dados do dashboard foram atualizados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar dados do dashboard:", error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível atualizar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

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
          description: `${dashboardData?.alertas.find(a => a.tipo === 'danger')?.titulo || '12 emails de cobrança'} enviados para financeiro@imobiliariafirenze.com.br`,
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

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se não houver dados, mostrar mensagem de erro
  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle size={48} className="text-danger mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-muted mb-4">Não foi possível carregar os dados do dashboard</p>
          <Button onClick={carregarDadosDashboard}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  // Preparar os dados para os cards
  const cards = [
    { 
      title: "Total de Imóveis", 
      value: dashboardData.estatisticas.totalImoveis.toString(), 
      icon: Home, 
      color: "bg-primary",
      change: "+2.5%",
      trend: "up"
    },
    { 
      title: "Contratos Ativos", 
      value: dashboardData.estatisticas.contratosAtivos.toString(), 
      icon: FileText, 
      color: "bg-success",
      change: "+5.2%",
      trend: "up"
    },
    { 
      title: "Taxa de Ocupação", 
      value: `${dashboardData.estatisticas.taxaOcupacao}%`, 
      icon: BarChart3, 
      color: "bg-warning",
      change: "+1.8%",
      trend: "up"
    },
    { 
      title: "Receita Mensal", 
      value: `R$ ${dashboardData.estatisticas.receitaMensal.toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-secondary",
      change: "+8.3%",
      trend: "up"
    },
  ];
  
  return (
    <div className="flex h-screen bg-background">
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
        
        <div className={`fixed top-0 left-0 bottom-0 flex flex-col w-64 bg-primary z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <AdminSidebar isMobile={true} setMobileOpen={setMobileMenuOpen} />
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="md:hidden mr-3 text-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Dashboard - Imobiliária Firenze</h1>
                <p className="text-sm text-muted">www.imobiliariafirenze.com.br</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={atualizarDados}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Atualizando..." : "Atualizar"}
              </Button>
              
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
                  <span className="absolute top-0 right-0 w-4 h-4 bg-danger rounded-full text-xs flex items-center justify-center text-white">
                    {dashboardData.alertas.filter(alert => alert.prioridade === "Urgente" || alert.prioridade === "Alta").length}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {/* Cards informativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
              <Card key={index} className="border-t-4 border-t-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted">{card.title}</p>
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                      <div className="flex items-center mt-1">
                        {card.trend === "up" ? (
                          <TrendingUp size={14} className="text-success mr-1" />
                        ) : (
                          <TrendingDown size={14} className="text-danger mr-1" />
                        )}
                        <span className={`text-sm ${card.trend === "up" ? "text-success" : "text-danger"}`}>
                          {card.change}
                        </span>
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
          {dashboardData.estatisticas.taxaInadimplencia > 5 && (
            <div className="mb-6">
              <Card className="border-l-4 border-l-danger bg-danger/10">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle size={20} className="text-danger mr-3" />
                    <div>
                      <h3 className="font-medium text-danger">Atenção: Alta Taxa de Inadimplência</h3>
                      <p className="text-sm text-danger/80">
                        Taxa atual: {dashboardData.estatisticas.taxaInadimplencia}% - Recomendamos ação imediata de cobrança
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto bg-danger hover:bg-danger/90"
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
                  <BarChart3 size={20} className="mr-2 text-primary" />
                  Receita vs Meta Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.graficos.receitaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="mes" stroke="var(--muted)" />
                      <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} stroke="var(--muted)" />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, '']}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
                        name="Receita" 
                        dot={{ stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--card)' }}
                        activeDot={{ stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--primary)', r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="meta" 
                        stroke="var(--secondary)" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        name="Meta"
                        dot={{ stroke: 'var(--secondary)', strokeWidth: 2, fill: 'var(--card)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Gráfico de Ocupação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home size={20} className="mr-2 text-primary" />
                  Distribuição de Ocupação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.graficos.ocupacaoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="valor"
                        label={({nome, valor}) => `${nome}: ${valor}%`}
                      >
                        {dashboardData.graficos.ocupacaoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, '']}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                      <Legend />
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
                  <DollarSign size={20} className="mr-2 text-primary" />
                  Receita por Tipo de Imóvel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.graficos.tipoImovelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="categoria" stroke="var(--muted)" />
                      <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} stroke="var(--muted)" />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Receita']}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                      <Bar dataKey="receita" fill="var(--secondary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Receita por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 size={20} className="mr-2 text-primary" />
                  Receita por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.graficos.receitaPorCategoria.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{
                          backgroundColor: ['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)'][index]
                        }}></div>
                        <span className="text-sm font-medium text-foreground">{item.categoria}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">R$ {item.valor.toLocaleString()}</p>
                        <p className="text-xs text-muted">{item.percentual}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    {dashboardData.graficos.receitaPorCategoria.map((item, index) => {
                      // Calcular a posição inicial para cada segmento
                      const previousPercentages = dashboardData.graficos.receitaPorCategoria
                        .slice(0, index)
                        .reduce((sum, i) => sum + i.percentual, 0);
                      
                      return (
                        <div
                          key={index}
                          className="h-full float-left"
                          style={{
                            width: `${item.percentual}%`,
                            marginLeft: index === 0 ? '0' : undefined,
                            backgroundColor: ['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)'][index]
                          }}
                        />
                      );
                    })}
                  </div>
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
                  <AlertTriangle size={20} className="mr-2 text-primary" />
                  Alertas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className={`p-3 rounded-md border-l-4 ${
                        alerta.tipo === "danger" ? "bg-danger/10 border-l-danger" :
                        alerta.tipo === "warning" ? "bg-warning/10 border-l-warning" :
                        alerta.tipo === "success" ? "bg-success/10 border-l-success" :
                        "bg-info/10 border-l-info"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{alerta.titulo}</p>
                          <p className="text-xs text-muted mt-1">{alerta.acao}</p>
                          <div className="flex items-center mt-2">
                            <Badge 
                              className={
                                alerta.prioridade === "Urgente" ? "bg-danger/20 text-danger" :
                                alerta.prioridade === "Alta" ? "bg-warning/20 text-warning" :
                                alerta.prioridade === "Média" ? "bg-info/20 text-info" :
                                "bg-success/20 text-success"
                              }
                            >
                              {alerta.prioridade}
                            </Badge>
                            <span className="text-xs text-muted ml-2">{alerta.data}</span>
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
                  <Calendar size={20} className="mr-2 text-primary" />
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.proximosVencimentos.map((vencimento, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                      <div>
                        <p className="font-medium text-sm text-foreground">{vencimento.contrato}</p>
                        <p className="text-xs text-muted">{vencimento.inquilino}</p>
                        <p className="text-xs text-muted">{new Date(vencimento.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-foreground">
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
                  <Link to="/admin/contratos" className="text-primary hover:text-primary/80 text-sm font-medium">
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
                <Link to="/admin/imoveis/novo">
                  <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-2">
                    <Home size={20} />
                    <span className="text-xs">Novo Imóvel</span>
                  </Button>
                </Link>
                
                <Link to="/admin/contratos/novo">
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
