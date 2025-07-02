// frontend/src/pages/admin/Imoveis.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  Search,
  Edit,
  Trash2,
  Menu,
  X,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Eye,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/apiService";
import axios, { AxiosError } from "axios"; // Adicionado para correção

// Definição do tipo de imóvel
interface Imovel {
  id: string;
  titulo: string;
  tipo: "Apartamento" | "Casa" | "Comercial" | "Terreno";
  operacao: "Venda" | "Aluguel";
  preco: number;
  precoCondominio?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  areaUtil: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  descricao: string;
  caracteristicas: string[];
  fotos: string[];
  destaque: boolean;
  status: "Disponível" | "Ocupado" | "Reservado" | "Manutenção";
  dataCadastro: string;
}

// Componente principal
const Imoveis = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filteredImoveis, setFilteredImoveis] = useState<Imovel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [operacaoFilter, setOperacaoFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imovelToDelete, setImovelToDelete] = useState<Imovel | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [imovelToView, setImovelToView] = useState<Imovel | null>(null);

  // Carregar imóveis
  const carregarImoveis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/imoveis');
      setImoveis(response.data);
      setFilteredImoveis(response.data);
    } catch (error) { // Removido 'any'
      if (axios.isAxiosError(error)) { // Correção da estrutura do catch
        console.error("Erro ao carregar imóveis:", error);
        toast({
          title: "Erro ao carregar imóveis",
          description: error.response?.data?.message || "Não foi possível carregar a lista de imóveis",
          variant: "destructive",
        });
      } else { // Adicionado tratamento para erros não-Axios
        console.error("Erro inesperado ao carregar imóveis:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar os imóveis.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar imóveis ao montar o componente
  useEffect(() => {
    carregarImoveis();
  }, []);

  // Filtrar imóveis quando os filtros ou o termo de busca mudam
  useEffect(() => {
    let result = [...imoveis];
    
    // Aplicar filtro de tipo
    if (tipoFilter !== "todos") {
      result = result.filter(imovel => imovel.tipo === tipoFilter);
    }
    
    // Aplicar filtro de operação
    if (operacaoFilter !== "todos") {
      result = result.filter(imovel => imovel.operacao === operacaoFilter);
    }
    
    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      result = result.filter(imovel => imovel.status === statusFilter);
    }
    
    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        imovel =>
          imovel.titulo.toLowerCase().includes(term) ||
          imovel.endereco.toLowerCase().includes(term) ||
          imovel.bairro.toLowerCase().includes(term) ||
          imovel.cidade.toLowerCase().includes(term)
      );
    }
    
    setFilteredImoveis(result);
  }, [imoveis, tipoFilter, operacaoFilter, statusFilter, searchTerm]);

  // Atualizar dados
  const atualizarDados = async () => {
    try {
      setRefreshing(true);
      await carregarImoveis();
      toast({
        title: "Dados atualizados",
        description: "A lista de imóveis foi atualizada com sucesso",
      });
    } catch (error) { // Removido 'any'
      if (axios.isAxiosError(error)) { // Correção da estrutura do catch
        console.error("Erro ao atualizar dados:", error);
        toast({
          title: "Erro ao atualizar dados",
          description: error.response?.data?.message || "Não foi possível atualizar a lista de imóveis",
          variant: "destructive",
        });
      } else { // Adicionado tratamento para erros não-Axios
        console.error("Erro inesperado ao atualizar dados:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao atualizar os dados.",
          variant: "destructive",
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Abrir diálogo de exclusão
  const handleDeleteClick = (imovel: Imovel) => {
    setImovelToDelete(imovel);
    setDeleteDialogOpen(true);
  };

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!imovelToDelete) return;
    
    try {
      await api.delete(`/imoveis/${imovelToDelete.id}`);
      setImoveis(imoveis.filter(i => i.id !== imovelToDelete.id));
      toast({
        title: "Imóvel excluído",
        description: `O imóvel ${imovelToDelete.titulo} foi excluído com sucesso`,
      });
    } catch (error) { // Removido 'any'
      if (axios.isAxiosError(error)) { // Correção da estrutura do catch
        console.error("Erro ao excluir imóvel:", error);
        toast({
          title: "Erro ao excluir imóvel",
          description: error.response?.data?.message || "Não foi possível excluir o imóvel",
          variant: "destructive",
        });
      } else { // Adicionado tratamento para erros não-Axios
        console.error("Erro inesperado ao excluir imóvel:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao excluir o imóvel.",
          variant: "destructive",
        });
      }
    } finally {
      setDeleteDialogOpen(false);
      setImovelToDelete(null);
    }
  };

  // Abrir diálogo de visualização
  const handleViewClick = (imovel: Imovel) => {
    setImovelToView(imovel);
    setViewDialogOpen(true);
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Exportar para CSV
  const exportarCSV = () => {
    // Cabeçalhos do CSV
    const headers = ["Título", "Tipo", "Operação", "Preço", "Endereço", "Bairro", "Cidade", "Estado", "Área", "Quartos", "Banheiros", "Status"];
    
    // Converter dados para formato CSV
    const csvData = filteredImoveis.map(imovel => [
      imovel.titulo,
      imovel.tipo,
      imovel.operacao,
      imovel.preco.toString(),
      imovel.endereco,
      imovel.bairro,
      imovel.cidade,
      imovel.estado,
      imovel.areaUtil.toString(),
      imovel.quartos?.toString() || "N/A",
      imovel.banheiros?.toString() || "N/A",
      imovel.status
    ]);
    
    // Juntar cabeçalhos e dados
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `imoveis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando imóveis...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-semibold text-foreground">Gestão de Imóveis</h1>
                <p className="text-sm text-muted">Administre os imóveis da imobiliária</p>
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
              
              <Link to="/admin/imoveis/novo">
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Novo Imóvel
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {/* Filtros e busca */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
                    <Input
                      placeholder="Buscar por título, endereço, bairro ou cidade..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-40">
                    <Select
                      value={tipoFilter}
                      onValueChange={(value) => setTipoFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os tipos</SelectItem>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-40">
                    <Select
                      value={operacaoFilter}
                      onValueChange={(value) => setOperacaoFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as operações</SelectItem>
                        <SelectItem value="Venda">Venda</SelectItem>
                        <SelectItem value="Aluguel">Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-40">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={exportarCSV}
                  >
                    <Download size={16} />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabela de imóveis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Home size={20} className="mr-2 text-primary" />
                  Lista de Imóveis
                </div>
                <Badge variant="outline">
                  {filteredImoveis.length} imóveis
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImoveis.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted">
                          Nenhum imóvel encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredImoveis.map((imovel) => (
                        <TableRow key={imovel.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {imovel.destaque && (
                                <Badge className="mr-2 bg-warning text-warning-foreground">
                                  Destaque
                                </Badge>
                              )}
                              {imovel.titulo}
                            </div>
                          </TableCell>
                          <TableCell>{imovel.tipo}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                imovel.operacao === 'Venda' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                              }
                            >
                              {imovel.operacao}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatCurrency(imovel.preco)}</div>
                              {imovel.precoCondominio && (
                                <div className="text-xs text-muted">
                                  + {formatCurrency(imovel.precoCondominio)} (cond.)
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1 text-muted" />
                              <span className="text-sm">{imovel.bairro}, {imovel.cidade}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-xs text-muted">
                              <div className="flex items-center">
                                <Ruler size={12} className="mr-1" />
                                {imovel.areaUtil}m²
                              </div>
                              {imovel.quartos !== undefined && (
                                <div className="flex items-center">
                                  <Bed size={12} className="mr-1" />
                                  {imovel.quartos}
                                </div>
                              )}
                              {imovel.banheiros !== undefined && (
                                <div className="flex items-center">
                                  <Bath size={12} className="mr-1" />
                                  {imovel.banheiros}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                imovel.status === 'Disponível' ? 'bg-success/10 text-success' :
                                imovel.status === 'Ocupado' ? 'bg-primary/10 text-primary' :
                                imovel.status === 'Reservado' ? 'bg-warning/10 text-warning' :
                                'bg-danger/10 text-danger'
                              }
                            >
                              {imovel.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Ações
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewClick(imovel)}>
                                  <Eye size={16} className="mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link to={`/admin/imoveis/editar/${imovel.id}`} className="flex items-center">
                                    <Edit size={16} className="mr-2" />
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(imovel)}
                                  className="text-danger"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Diálogo de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o imóvel <strong>{imovelToDelete?.titulo}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{imovelToView?.titulo}</DialogTitle>
            <DialogDescription>
              Detalhes do imóvel
            </DialogDescription>
          </DialogHeader>
          
          {imovelToView && (
            <div className="space-y-6">
              {/* Imagem principal */}
              {imovelToView.fotos.length > 0 && (
                <div className="relative h-64 overflow-hidden rounded-md">
                  <img
                    src={imovelToView.fotos[0]}
                    alt={imovelToView.titulo}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-3 left-3 ${
                      imovelToView.operacao === "Venda" 
                        ? "bg-primary text-white" 
                        : "bg-secondary text-primary-dark"
                    }`}
                  >
                    {imovelToView.operacao}
                  </Badge>
                  {imovelToView.destaque && (
                    <Badge className="absolute top-3 right-3 bg-warning text-white">
                      Destaque
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informações Gerais</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted">Tipo:</span>
                      <span>{imovelToView.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Operação:</span>
                      <span>{imovelToView.operacao}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Preço:</span>
                      <span className="font-semibold">{formatCurrency(imovelToView.preco)}</span>
                    </div>
                    {imovelToView.precoCondominio && (
                      <div className="flex justify-between">
                        <span className="text-muted">Condomínio:</span>
                        <span>{formatCurrency(imovelToView.precoCondominio)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <Badge
                        className={
                          imovelToView.status === 'Disponível' ? 'bg-success/10 text-success' :
                          imovelToView.status === 'Ocupado' ? 'bg-primary/10 text-primary' :
                          imovelToView.status === 'Reservado' ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }
                      >
                        {imovelToView.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Data de cadastro:</span>
                      <span>{new Date(imovelToView.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Localização</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted">Endereço:</span>
                      <span>{imovelToView.endereco}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Bairro:</span>
                      <span>{imovelToView.bairro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Cidade:</span>
                      <span>{imovelToView.cidade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Estado:</span>
                      <span>{imovelToView.estado}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Características */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Características</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-md">
                    <Ruler size={20} className="mb-1 text-primary" />
                    <span className="text-sm font-medium">{imovelToView.areaUtil} m²</span>
                    <span className="text-xs text-muted">Área útil</span>
                  </div>
                  
                  {imovelToView.quartos !== undefined && (
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-md">
                      <Bed size={20} className="mb-1 text-primary" />
                      <span className="text-sm font-medium">{imovelToView.quartos}</span>
                      <span className="text-xs text-muted">Quartos</span>
                    </div>
                  )}
                  
                  {imovelToView.suites !== undefined && (
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-md">
                      <Bed size={20} className="mb-1 text-primary" />
                      <span className="text-sm font-medium">{imovelToView.suites}</span>
                      <span className="text-xs text-muted">Suítes</span>
                    </div>
                  )}
                  
                  {imovelToView.banheiros !== undefined && (
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-md">
                      <Bath size={20} className="mb-1 text-primary" />
                      <span className="text-sm font-medium">{imovelToView.banheiros}</span>
                      <span className="text-xs text-muted">Banheiros</span>
                    </div>
                  )}
                  
                  {imovelToView.vagas !== undefined && (
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/20 rounded-md">
                      <Home size={20} className="mb-1 text-primary" />
                      <span className="text-sm font-medium">{imovelToView.vagas}</span>
                      <span className="text-xs text-muted">Vagas</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-muted">{imovelToView.descricao}</p>
              </div>
              
              {/* Características adicionais */}
              {imovelToView.caracteristicas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Características adicionais</h3>
                  <div className="flex flex-wrap gap-2">
                    {imovelToView.caracteristicas.map((caracteristica, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/10">
                        <Tag size={12} className="mr-1 text-primary" />
                        {caracteristica}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botões de ação */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Link to={`/admin/imoveis/editar/${imovelToView.id}`}>
                  <Button className="flex items-center gap-2">
                    <Edit size={16} />
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Imoveis;