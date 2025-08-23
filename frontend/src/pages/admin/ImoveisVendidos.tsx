// frontend/src/pages/admin/ImoveisVendidos.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  Search,
  Menu,
  X,
  RefreshCw,
  Download,
  Eye,
  History,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  FileText
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from "@/utils/csvUtils";
import axios from "axios";

// Interface para imóvel vendido
interface ImovelVendido {
  _id: string;
  grupo: number;
  bloco: string;
  andar: number;
  apartamento: number;
  configuracaoPlanta: string;
  areaUtil: number;
  preco: number;
  statusAnuncio: string;
  dataStatusAtual: string;
  historico: HistoricoItem[];
}

interface HistoricoItem {
  tipo: string;
  data: string;
  comprador?: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
  };
  valorVenda?: number;
  documentosEntregues?: string[];
  motivo?: string;
  observacoes?: string;
  statusAnterior?: string;
  novoStatus?: string;
  dataRegistro: string;
  usuarioResponsavel?: string;
}

const ImoveisVendidos = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imoveis, setImoveis] = useState<ImovelVendido[]>([]);
  const [filteredImoveis, setFilteredImoveis] = useState<ImovelVendido[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoFilter, setGrupoFilter] = useState<string>("todos");
  const [blocoFilter, setBlocoFilter] = useState<string>("todos");
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [imovelSelecionado, setImovelSelecionado] = useState<ImovelVendido | null>(null);

  // Carregar imóveis vendidos
  const carregarImoveisVendidos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/imoveis/vendidos/listar');
      setImoveis(response.data.imoveis || []);
      setFilteredImoveis(response.data.imoveis || []);
    } catch (error) {
      console.error("Erro ao carregar imóveis vendidos:", error);
      toast({
        title: "Erro ao carregar imóveis vendidos",
        description: "Não foi possível carregar a lista de imóveis vendidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar imóveis ao montar o componente
  useEffect(() => {
    carregarImoveisVendidos();
  }, [carregarImoveisVendidos]);

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
    
    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        imovel => {
          const vendaInfo = imovel.historico.find(h => h.tipo === 'venda');
          return (
            imovel.grupo?.toString().toLowerCase().includes(term) ||
            imovel.bloco?.toLowerCase().includes(term) ||
            imovel.andar?.toString().toLowerCase().includes(term) ||
            imovel.apartamento?.toString().toLowerCase().includes(term) ||
            vendaInfo?.comprador?.nome?.toLowerCase().includes(term) ||
            vendaInfo?.comprador?.cpf?.toLowerCase().includes(term)
          );
        }
      );
    }
    
    setFilteredImoveis(result);
  }, [imoveis, grupoFilter, blocoFilter, searchTerm]);

  // Atualizar dados
  const atualizarDados = async () => {
    try {
      setRefreshing(true);
      await carregarImoveisVendidos();
      toast({
        title: "Dados atualizados",
        description: "A lista de imóveis vendidos foi atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível atualizar a lista de imóveis vendidos",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = ["Grupo", "Bloco", "Andar", "Apartamento", "Configuração", "Área", "Preço Original", "Valor Venda", "Comprador", "CPF", "Data Venda"];
    
    const csvData = filteredImoveis.map(imovel => {
      const vendaInfo = imovel.historico.find(h => h.tipo === 'venda');
      return [
        imovel.grupo || "N/A",
        imovel.bloco || "N/A",
        imovel.andar?.toString() || "N/A",
        imovel.apartamento || "N/A",
        imovel.configuracaoPlanta || "N/A",
        imovel.areaUtil?.toString() || "N/A",
        imovel.preco?.toString() || "N/A",
        vendaInfo?.valorVenda?.toString() || "N/A",
        vendaInfo?.comprador?.nome || "N/A",
        vendaInfo?.comprador?.cpf || "N/A",
        vendaInfo?.data ? formatDate(vendaInfo.data) : "N/A"
      ];
    });
    
    exportToCsv(headers, csvData, `imoveis_vendidos_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Abrir histórico
  const abrirHistorico = (imovel: ImovelVendido) => {
    setImovelSelecionado(imovel);
    setHistoricoDialogOpen(true);
  };

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando imóveis vendidos...</p>
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
                <h1 className="text-xl font-semibold text-foreground">Imóveis Vendidos</h1>
                <p className="text-sm text-muted">Histórico de vendas e gestão de baixas</p>
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
              
              <Link to="/admin/imoveis">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Home size={16} />
                  Todos os Imóveis
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
                      placeholder="Buscar por grupo, bloco, apartamento, comprador ou CPF..."
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
          
          {/* Tabela de imóveis vendidos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign size={20} className="mr-2 text-primary" />
                  Imóveis Vendidos
                </div>
                <Badge variant="outline">
                  {filteredImoveis.length} vendas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imóvel</TableHead>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Valor Venda</TableHead>
                      <TableHead>Data Venda</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImoveis.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted">
                          Nenhum imóvel vendido encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredImoveis.map((imovel) => {
                        const vendaInfo = imovel.historico.find(h => h.tipo === 'venda');
                        return (
                          <TableRow key={imovel._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">
                                  Grupo {imovel.grupo} - Torre {imovel.bloco}
                                </span>
                                <span className="text-sm text-muted">
                                  Andar {imovel.andar} - Apto {imovel.apartamento}
                                </span>
                                <span className="text-xs text-muted">
                                  {imovel.configuracaoPlanta} - {imovel.areaUtil}m²
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{vendaInfo?.comprador?.nome || 'N/A'}</span>
                                <span className="text-sm text-muted">{vendaInfo?.comprador?.cpf || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-600">
                                {vendaInfo?.valorVenda ? formatCurrency(vendaInfo.valorVenda) : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                <span>{vendaInfo?.data ? formatDate(vendaInfo.data) : 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gray-100 text-gray-800">
                                {imovel.statusAnuncio}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirHistorico(imovel)}
                                className="flex items-center gap-2"
                              >
                                <History size={16} />
                                Histórico
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Diálogo de histórico */}
      <Dialog open={historicoDialogOpen} onOpenChange={setHistoricoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Histórico - Grupo {imovelSelecionado?.grupo} - Torre {imovelSelecionado?.bloco} - Apto {imovelSelecionado?.apartamento}
            </DialogTitle>
            <DialogDescription>
              Histórico completo de transações e alterações do imóvel
            </DialogDescription>
          </DialogHeader>
          
          {imovelSelecionado && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {imovelSelecionado.historico.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      className={
                        item.tipo === 'venda' ? 'bg-green-100 text-green-800' :
                        item.tipo === 'reversao_venda' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {item.tipo === 'venda' ? 'Venda' :
                       item.tipo === 'reversao_venda' ? 'Reversão de Venda' :
                       item.tipo.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted">
                      {formatDate(item.data)}
                    </span>
                  </div>
                  
                  {item.tipo === 'venda' && item.comprador && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <User size={16} className="mr-2" />
                          Dados do Comprador
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Nome:</strong> {item.comprador.nome}</div>
                          <div><strong>CPF:</strong> {item.comprador.cpf}</div>
                          <div className="flex items-center">
                            <Mail size={12} className="mr-1" />
                            <strong>Email:</strong> {item.comprador.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={12} className="mr-1" />
                            <strong>Telefone:</strong> {item.comprador.telefone}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <DollarSign size={16} className="mr-2" />
                          Detalhes da Venda
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Valor:</strong> {item.valorVenda ? formatCurrency(item.valorVenda) : 'N/A'}</div>
                          {item.documentosEntregues && item.documentosEntregues.length > 0 && (
                            <div>
                              <strong>Documentos:</strong>
                              <ul className="list-disc list-inside ml-2">
                                {item.documentosEntregues.map((doc, i) => (
                                  <li key={i}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {item.observacoes && (
                    <div className="mt-3">
                      <h4 className="font-semibold mb-1 flex items-center">
                        <FileText size={16} className="mr-2" />
                        Observações
                      </h4>
                      <p className="text-sm text-muted bg-gray-50 p-2 rounded">
                        {item.observacoes}
                      </p>
                    </div>
                  )}
                  
                  {item.motivo && (
                    <div className="mt-3">
                      <h4 className="font-semibold mb-1">Motivo</h4>
                      <p className="text-sm text-muted">{item.motivo}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-muted border-t pt-2">
                    <div>Registrado em: {formatDate(item.dataRegistro)}</div>
                    {item.usuarioResponsavel && (
                      <div>Responsável: {item.usuarioResponsavel}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImoveisVendidos;