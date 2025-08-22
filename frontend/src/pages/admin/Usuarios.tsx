// frontend/src/pages/admin/Usuarios.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Menu,
  X,
  RefreshCw,
  Filter,
  Download,
  KeyRound
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
import { userService } from "@/services/userService";
import axios, { AxiosError } from "axios";
import { exportToCsv } from "@/utils/csvUtils";

// Definição do tipo de usuário
interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: 'admin' | 'inquilino' | 'proprietario' | 'corretor';
  status: 'ativo' | 'inativo' | 'pendente';
  dataCadastro: string;
  ultimoAcesso?: string;
  // Campos específicos para inquilinos
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

// Componente principal
const Usuarios = () => {
  const { toast, clearAllToasts } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [perfilFilter, setPerfilFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    perfil: "" as Usuario['perfil'] | "", // Tipagem mais específica
    status: "" as Usuario['status'] | "", // Tipagem mais específica
    cpf: "",
    rg: "",
    dataNascimento: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: ""
    }
  });

  // Carregar usuários (envolvido em useCallback)
  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
      setFilteredUsuarios(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao carregar usuários:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: error.response?.data?.message || "Não foi possível carregar a lista de usuários",
          variant: "destructive",
        });
      } else {
        console.error("Erro inesperado ao carregar usuários:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar os usuários.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]); // Adicionado toast como dependência

  // Carregar usuários ao montar o componente
  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]); // Adicionado carregarUsuarios como dependência

  // Filtrar usuários quando os filtros ou o termo de busca mudam
  useEffect(() => {
    let result = [...usuarios];
    
    // Aplicar filtro de perfil
    if (perfilFilter !== "todos") {
      result = result.filter(usuario => usuario.perfil === perfilFilter);
    }
    
    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      result = result.filter(usuario => usuario.status === statusFilter);
    }
    
    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        usuario =>
          usuario.nome.toLowerCase().includes(term) ||
          usuario.email.toLowerCase().includes(term) ||
          usuario.telefone.includes(term)
      );
    }
    
    setFilteredUsuarios(result);
  }, [usuarios, perfilFilter, statusFilter, searchTerm]);

  // Atualizar dados
  const atualizarDados = async () => {
    try {
      setRefreshing(true);
      await carregarUsuarios();
      toast({
        title: "Dados atualizados",
        description: "A lista de usuários foi atualizada com sucesso",
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao atualizar dados:", error);
        toast({
          title: "Erro ao atualizar dados",
          description: error.response?.data?.message || "Não foi possível atualizar a lista de usuários",
          variant: "destructive",
        });
      } else {
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
  const handleDeleteClick = (usuario: Usuario) => {
    console.log('🗑️ Abrindo diálogo de exclusão para:', usuario.nome);
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!usuarioToDelete) return;
    
    try {
      await api.delete(`/usuarios/${usuarioToDelete.id}`);
      setUsuarios(usuarios.filter(u => u.id !== usuarioToDelete.id));
      toast({
        title: "Usuário excluído",
        description: `O usuário ${usuarioToDelete.nome} foi excluído com sucesso`,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao excluir usuário:", error);
        toast({
          title: "Erro ao excluir usuário",
          description: error.response?.data?.message || "Não foi possível excluir o usuário",
          variant: "destructive",
        });
      } else {
        console.error("Erro inesperado ao excluir usuário:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao excluir o usuário.",
          variant: "destructive",
        });
      }
    } finally {
      console.log('🗑️ Fechando diálogo de exclusão');
      setDeleteDialogOpen(false);
      setUsuarioToDelete(null);
    }
  };

  // Abrir diálogo de edição
  const handleEditClick = (usuario: Usuario) => {
    console.log('✏️ Abrindo diálogo de edição para:', usuario.nome);
    setUsuarioToEdit(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      perfil: usuario.perfil,
      status: usuario.status,
      cpf: usuario.cpf || "",
      rg: usuario.rg || "",
      dataNascimento: usuario.dataNascimento || "",
      endereco: {
        rua: usuario.endereco?.rua || "",
        numero: usuario.endereco?.numero || "",
        complemento: usuario.endereco?.complemento || "",
        bairro: usuario.endereco?.bairro || "",
        cidade: usuario.endereco?.cidade || "",
        estado: usuario.endereco?.estado || "",
        cep: usuario.endereco?.cep || ""
      }
    });
    setEditDialogOpen(true);
  };

  // Atualizar campo do formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Verificar se é um campo de endereço
    if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Atualizar campo select do formulário
  const handleSelectChange = (name: string, value: string) => {
    if (name === "perfil") {
        setFormData(prev => ({ ...prev, [name]: value as Usuario['perfil'] }));
    } else if (name === "status") {
        setFormData(prev => ({ ...prev, [name]: value as Usuario['status'] }));
    } else {
        // Isso não deve acontecer com os campos que estamos tratando.
        // Se houver outros selects, eles precisariam de tratamento específico.
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Confirmar edição
  const handleEditConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioToEdit) return;
    
    try {
      await api.put(`/usuarios/${usuarioToEdit.id}`, formData);
      
      // Atualizar a lista de usuários, garantindo a tipagem correta
      setUsuarios(usuarios.map(u => 
        u.id === usuarioToEdit.id 
          ? { 
              ...u, 
              nome: formData.nome,
              email: formData.email,
              telefone: formData.telefone,
              perfil: formData.perfil, 
              status: formData.status 
            } as Usuario // Casting final para garantir que o objeto resultante é um Usuario válido
          : u
      ));
      
      toast({
        title: "Usuário atualizado",
        description: `Os dados de ${formData.nome} foram atualizados com sucesso`,
      });
      
      console.log('✏️ Fechando diálogo de edição após sucesso');
      setEditDialogOpen(false);
      setUsuarioToEdit(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao atualizar usuário:", error);
        toast({
          title: "Erro ao atualizar usuário",
          description: error.response?.data?.message || "Não foi possível atualizar os dados do usuário",
          variant: "destructive",
        });
      } else {
        console.error("Erro inesperado ao atualizar usuário:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao atualizar os dados.",
          variant: "destructive",
        });
      }
    }
  };

  // Solicitar reset de senha
  const handleResetPassword = async (usuario: Usuario) => {
    try {
      await userService.requestUserPasswordReset(usuario.id);
      toast({
        title: "Reset de senha solicitado",
        description: `Um e-mail com instruções para redefinir a senha foi enviado para ${usuario.email}`,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao solicitar reset de senha:", error);
        toast({
          title: "Erro ao solicitar reset de senha",
          description: error.response?.data?.message || "Não foi possível solicitar o reset de senha",
          variant: "destructive",
        });
      } else {
        console.error("Erro inesperado ao solicitar reset de senha:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao solicitar o reset de senha.",
          variant: "destructive",
        });
      }
    }
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = ["Nome", "Email", "Telefone", "Perfil", "Status", "Data de Cadastro", "Último Acesso"];
    
    const csvData = filteredUsuarios.map(usuario => [
      usuario.nome,
      usuario.email,
      usuario.telefone || '',
      usuario.perfil,
      usuario.status,
      new Date(usuario.dataCadastro).toLocaleDateString('pt-BR'),
      usuario.ultimoAcesso ? new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR') : 'N/A'
    ]);
    
    exportToCsv(headers, csvData, `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Renderizar o componente de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando usuários...</p>
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
                <h1 className="text-xl font-semibold text-foreground">Gestão de Usuários</h1>
                <p className="text-sm text-muted">Administre os usuários do sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllToasts}
                className="flex items-center gap-2"
                title="Limpar todos os toasts (use se a tela estiver bloqueada)"
              >
                <X size={16} />
                Limpar Toasts
              </Button>
              
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
              
              <Link to="/admin/usuarios/novo">
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Novo Usuário
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
                      placeholder="Buscar por nome, email ou telefone..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-40">
                    <Select
                      value={perfilFilter}
                      onValueChange={(value) => setPerfilFilter(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os perfis</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                        <SelectItem value="proprietario">Proprietário</SelectItem>
                        <SelectItem value="corretor">Corretor</SelectItem>
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
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
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
          
          {/* Tabela de usuários */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users size={20} className="mr-2 text-primary" />
                  Lista de Usuários
                </div>
                <Badge variant="outline">
                  {filteredUsuarios.length} usuários
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsuarios.map((usuario, index) => (
                        <TableRow key={usuario.id || `usuario-${index}`}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>{usuario.telefone}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                usuario.perfil === 'admin' ? 'bg-primary/10 text-primary' :
                                usuario.perfil === 'inquilino' ? 'bg-info/10 text-info' :
                                usuario.perfil === 'proprietario' ? 'bg-secondary/10 text-secondary' :
                                'bg-warning/10 text-warning'
                              }
                            >
                              {usuario.perfil === 'admin' ? 'Administrador' :
                               usuario.perfil === 'inquilino' ? 'Inquilino' :
                               usuario.perfil === 'proprietario' ? 'Proprietário' :
                               'Corretor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {usuario.status === 'ativo' ? (
                                <CheckCircle size={16} className="mr-1 text-success" />
                              ) : usuario.status === 'inativo' ? (
                                <XCircle size={16} className="mr-1 text-danger" />
                              ) : (
                                <Filter size={16} className="mr-1 text-warning" />
                              )}
                              <span
                                className={
                                  usuario.status === 'ativo' ? 'text-success' :
                                  usuario.status === 'inativo' ? 'text-danger' :
                                  'text-warning'
                                }
                              >
                                {usuario.status === 'ativo' ? 'Ativo' :
                                 usuario.status === 'inativo' ? 'Inativo' :
                                 'Pendente'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {usuario.ultimoAcesso
                              ? new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')
                              : 'Nunca acessou'}
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
                                <DropdownMenuItem onClick={() => handleEditClick(usuario)}>
                                  <Edit size={16} className="mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(usuario)}>
                                  <KeyRound size={16} className="mr-2" />
                                  Reset de Senha
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(usuario)}
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
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        console.log('🗑️ Dialog exclusão onOpenChange:', open);
        setDeleteDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{usuarioToDelete?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                console.log('🗑️ Cancelando exclusão via botão');
                setDeleteDialogOpen(false);
              }}
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
      
      {/* Diálogo de edição */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        console.log('✏️ Dialog edição onOpenChange:', open);
        setEditDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditConfirm}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="nome" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="telefone" className="text-sm font-medium">
                    Telefone
                  </label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="perfil" className="text-sm font-medium">
                    Perfil
                  </label>
                  <Select
                    value={formData.perfil}
                    onValueChange={(value) => handleSelectChange("perfil", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="inquilino">Inquilino</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                      <SelectItem value="corretor">Corretor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Campos específicos para inquilinos */}
                {formData.perfil === 'inquilino' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cpf" className="text-sm font-medium">
                          CPF
                        </label>
                        <Input
                          id="cpf"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleFormChange}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="rg" className="text-sm font-medium">
                          RG
                        </label>
                        <Input
                          id="rg"
                          name="rg"
                          value={formData.rg}
                          onChange={handleFormChange}
                          placeholder="00.000.000-0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="dataNascimento" className="text-sm font-medium">
                        Data de Nascimento
                      </label>
                      <Input
                        id="dataNascimento"
                        name="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Endereço</h4>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label htmlFor="endereco.rua" className="text-sm font-medium">
                            Rua
                          </label>
                          <Input
                            id="endereco.rua"
                            name="endereco.rua"
                            value={formData.endereco.rua}
                            onChange={handleFormChange}
                            placeholder="Nome da rua"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endereco.numero" className="text-sm font-medium">
                            Número
                          </label>
                          <Input
                            id="endereco.numero"
                            name="endereco.numero"
                            value={formData.endereco.numero}
                            onChange={handleFormChange}
                            placeholder="123"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="endereco.complemento" className="text-sm font-medium">
                            Complemento
                          </label>
                          <Input
                            id="endereco.complemento"
                            name="endereco.complemento"
                            value={formData.endereco.complemento}
                            onChange={handleFormChange}
                            placeholder="Apto, casa, etc."
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endereco.bairro" className="text-sm font-medium">
                            Bairro
                          </label>
                          <Input
                            id="endereco.bairro"
                            name="endereco.bairro"
                            value={formData.endereco.bairro}
                            onChange={handleFormChange}
                            placeholder="Nome do bairro"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="endereco.cidade" className="text-sm font-medium">
                            Cidade
                          </label>
                          <Input
                            id="endereco.cidade"
                            name="endereco.cidade"
                            value={formData.endereco.cidade}
                            onChange={handleFormChange}
                            placeholder="Nome da cidade"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endereco.estado" className="text-sm font-medium">
                            Estado
                          </label>
                          <Input
                            id="endereco.estado"
                            name="endereco.estado"
                            value={formData.endereco.estado}
                            onChange={handleFormChange}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endereco.cep" className="text-sm font-medium">
                            CEP
                          </label>
                          <Input
                            id="endereco.cep"
                            name="endereco.cep"
                            value={formData.endereco.cep}
                            onChange={handleFormChange}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log('✏️ Cancelando edição via botão');
                  setEditDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;