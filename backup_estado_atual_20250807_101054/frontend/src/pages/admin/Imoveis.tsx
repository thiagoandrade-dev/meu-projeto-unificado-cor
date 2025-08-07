// frontend/src/pages/admin/Imoveis.tsx
import { useState, useEffect, useCallback } from "react";
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
import { imoveisService } from "@/services/apiService";
import axios, { AxiosError } from "axios"; // Adicionado para correção
import { exportToCsv } from "@/utils/csvUtils";

// Importar a interface Imovel do apiService para manter consistência
import { Imovel } from "@/services/apiService";

// Componente principal
const Imoveis = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filteredImoveis, setFilteredImoveis] = useState<Imovel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoFilter, setGrupoFilter] = useState<string>("todos");
  const [blocoFilter, setBlocoFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imovelToDelete, setImovelToDelete] = useState<Imovel | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [imovelToView, setImovelToView] = useState<Imovel | null>(null);

  // Carregar imóveis
  const carregarImoveis = useCallback(async () => {
    try {
      setLoading(true);
      const data = await imoveisService.getAll();
      setImoveis(data);
      setFilteredImoveis(data);
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
  }, [toast]);

  // Carregar imóveis ao montar o componente
  useEffect(() => {
    carregarImoveis();
  }, [carregarImoveis]);

  // Filtrar imóveis quando os filtros ou o termo de busca mudam
  useEffect(() => {
    let result = [...imoveis];
    
    // Aplicar filtro de grupo
    if (grupoFilter !== "todos") {
      result = result.filter(imovel => imovel.grupo?.toString() === grupoFilter);
    }
    
    // Aplicar filtro de bloco
    if (blocoFilter !== "todos") {
      result = result.filter(imovel => imovel.bloco === blocoFilter);
    }
    
    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      result = result.filter(imovel => imovel.statusAnuncio === statusFilter);
    }
    
    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
          imovel => {
            return (
              imovel.grupo?.toString().toLowerCase().includes(term) ||
              imovel.bloco?.toLowerCase().includes(term) ||
              imovel.andar?.toString().toLowerCase().includes(term) ||
              imovel.apartamento?.toString().toLowerCase().includes(term) ||
              imovel.configuracaoPlanta?.toLowerCase().includes(term)
            );
          }
        );
    }
    
    setFilteredImoveis(result);
  }, [imoveis, grupoFilter, blocoFilter, statusFilter, searchTerm]);

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
      await imoveisService.delete(imovelToDelete._id);
      setImoveis(imoveis.filter(i => i._id !== imovelToDelete._id));
      toast({
        title: "Imóvel excluído",
        description: `O imóvel Grupo ${imovelToDelete.grupo} - Bloco ${imovelToDelete.bloco} - Apto ${imovelToDelete.apartamento} foi excluído com sucesso`,
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
    const headers = ["Grupo", "Bloco", "Andar", "Apartamento", "Configuração", "Área", "Vagas", "Tipo Vaga", "Status"];
    
    const csvData = filteredImoveis.map(imovel => [
      imovel.grupo || "N/A",
      imovel.bloco || "N/A",
      imovel.andar?.toString() || "N/A",
      imovel.apartamento || "N/A",
      imovel.configuracaoPlanta || "N/A",
      imovel.areaUtil?.toString() || "N/A",
      imovel.numVagasGaragem?.toString() || "N/A",
      imovel.tipoVagaGaragem || "N/A",
      imovel.statusAnuncio || "N/A"
    ]);
    
    exportToCsv(headers, csvData, `imoveis_${new Date().toISOString().split('T')[0]}.csv`);
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
                      placeholder="Buscar por grupo, bloco, andar, apartamento ou configuração..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-40">
                    <Select
                      value={grupoFilter}
                      onValueChange={(value) => setGrupoFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os grupos</SelectItem>
                        <SelectItem value="12">Grupo 12</SelectItem>
                        <SelectItem value="13">Grupo 13</SelectItem>
                        <SelectItem value="14">Grupo 14</SelectItem>
                        <SelectItem value="15">Grupo 15</SelectItem>
                        <SelectItem value="16">Grupo 16</SelectItem>
                        <SelectItem value="17">Grupo 17</SelectItem>
                        <SelectItem value="18">Grupo 18</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-40">
                    <Select
                      value={blocoFilter}
                      onValueChange={(value) => setBlocoFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bloco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os blocos</SelectItem>
                        <SelectItem value="A">Bloco A</SelectItem>
                        <SelectItem value="B">Bloco B</SelectItem>
                        <SelectItem value="C">Bloco C</SelectItem>
                        <SelectItem value="D">Bloco D</SelectItem>
                        <SelectItem value="E">Bloco E</SelectItem>
                        <SelectItem value="F">Bloco F</SelectItem>
                        <SelectItem value="G">Bloco G</SelectItem>
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
                        <SelectItem value="Disponível para Venda">Disponível para Venda</SelectItem>
                        <SelectItem value="Disponível para Locação">Disponível para Locação</SelectItem>
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
                      <TableHead>Grupo/Bloco</TableHead>
                      <TableHead>Andar/Apto</TableHead>
                      <TableHead>Configuração</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Vagas</TableHead>
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
                        <TableRow key={imovel._id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">Grupo {imovel.grupo}</span>
                              <span className="text-sm font-medium text-blue-600">Torre {imovel.bloco}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">Andar {imovel.andar}</div>
                              <div className="text-xs text-muted">Apto {imovel.apartamento}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{imovel.configuracaoPlanta}</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(imovel.preco)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Ruler size={12} className="mr-1" />
                              <span>{imovel.areaUtil}m²</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{imovel.numVagasGaragem} vaga{imovel.numVagasGaragem > 1 ? 's' : ''}</div>
                              <div className="text-xs text-muted">{imovel.tipoVagaGaragem}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                imovel.statusAnuncio?.includes('Disponível') ? 'bg-success/10 text-success' :
                                'bg-primary/10 text-primary'
                              }
                            >
                              {imovel.statusAnuncio}
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
                                  <Link to={`/admin/imoveis/editar/${imovel._id}`} className="flex items-center">
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
              Tem certeza que deseja excluir o imóvel <strong>Grupo {imovelToDelete?.grupo} - Bloco {imovelToDelete?.bloco} - Apto {imovelToDelete?.apartamento}</strong>?
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
            <DialogTitle>Grupo {imovelToView?.grupo} - Bloco {imovelToView?.bloco} - Apto {imovelToView?.apartamento}</DialogTitle>
            <DialogDescription>
              Detalhes do imóvel
            </DialogDescription>
          </DialogHeader>
          
          {imovelToView && (
            <div className="space-y-6">
              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informações Gerais</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted">Grupo:</span>
                      <span>{imovelToView.grupo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Bloco:</span>
                      <span>{imovelToView.bloco}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Andar:</span>
                      <span>{imovelToView.andar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Apartamento:</span>
                      <span>{imovelToView.apartamento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Preço:</span>
                      <span className="font-semibold">{formatCurrency(imovelToView.preco)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <Badge
                        className={
                          imovelToView.statusAnuncio === 'Disponível para Venda' ? 'bg-success/10 text-success' :
                          'bg-primary/10 text-primary'
                        }
                      >
                        {imovelToView.statusAnuncio}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Data de cadastro:</span>
                      <span>{imovelToView.createdAt ? new Date(imovelToView.createdAt).toLocaleDateString('pt-BR') : 'Data não informada'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Características</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted">Configuração:</span>
                      <span>{imovelToView.configuracaoPlanta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Área útil:</span>
                      <span>{imovelToView.areaUtil} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Vagas garagem:</span>
                      <span>{imovelToView.numVagasGaragem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Tipo vaga:</span>
                      <span>{imovelToView.tipoVagaGaragem}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Link to={`/admin/imoveis/editar/${imovelToView._id}`}>
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