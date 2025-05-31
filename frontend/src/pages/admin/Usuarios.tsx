import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Search, Pencil, Trash2, UserCheck, UserX, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { userService, User } from "@/services/userService";

// Schema para validação do formulário
const userFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  tipo: z.enum(["Administrador", "Locatário", "Funcionário"]),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  status: z.enum(["Ativo", "Inativo"]),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const AdminUsuarios = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<null | User>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      tipo: "Locatário",
      telefone: "",
      status: "Ativo",
      senha: "",
    },
  });

  // Carrega os usuários do backend
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAll();
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível obter a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtra os usuários com base na pesquisa
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(search.toLowerCase()) ||
      usuario.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const openAddDialog = () => {
    form.reset();
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    form.reset({
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      telefone: user.telefone || "",
      status: user.status,
      senha: "",
    });
    setDialogOpen(true);
  };
  
  const handleStatusChange = async (id: string, newStatus: "Ativo" | "Inativo") => {
    try {
      await userService.updateStatus(id, newStatus);
      
      // Recarregar lista de usuários
      await loadUsers();
      
      toast({
        title: "Status alterado",
        description: `Usuário agora está ${newStatus}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível atualizar o status do usuário",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;
    
    try {
      await userService.delete(id);
      
      // Recarregar lista de usuários
      await loadUsers();
      
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o usuário",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        const updateData: Partial<User> = {
          nome: data.nome,
          email: data.email,
          tipo: data.tipo,
          telefone: data.telefone,
          status: data.status,
        };
        
        // Só inclui senha se foi preenchida
        if (data.senha && data.senha.trim() !== "") {
          updateData.senha = data.senha;
        }
        
        await userService.update(String(editingUser._id || editingUser.id || ""), updateData);
        
        toast({
          title: "Usuário atualizado",
          description: `As informações de ${data.nome} foram atualizadas com sucesso`,
          duration: 3000,
        });
      } else {
        await userService.create({
          nome: data.nome,
          email: data.email,
          tipo: data.tipo,
          telefone: data.telefone,
          status: data.status,
          senha: data.senha || "",
        });
        
        toast({
          title: "Usuário criado",
          description: `${data.nome} foi cadastrado com sucesso`,
          duration: 3000,
        });
      }
      
      // Recarregar lista de usuários
      await loadUsers();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: editingUser ? "Erro ao atualizar" : "Erro ao cadastrar",
        description: error.response?.data?.erro || "Ocorreu um problema ao processar a operação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
            <p className="text-gray-600">Cadastre e gerencie os usuários do sistema</p>
          </div>
          
          <Button 
            className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2"
            onClick={openAddDialog}
          >
            <Plus size={16} />
            Novo Usuário
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar usuários por nome, email ou tipo..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando usuários...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Registrado em</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <tr key={usuario._id || usuario.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{usuario.nome}</td>
                        <td className="py-3 px-4">{usuario.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                              usuario.tipo === "Administrador"
                                ? "bg-purple-100 text-purple-800"
                                : usuario.tipo === "Funcionário"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {usuario.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4">{usuario.telefone || "-"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                              usuario.status === "Ativo"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {usuario.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {usuario.dataRegistro ? new Date(usuario.dataRegistro).toLocaleDateString('pt-BR') : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(usuario)}
                            >
                              <Pencil size={16} className="text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(String(usuario._id || usuario.id || ""))}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                            {usuario.status === "Ativo" ? (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStatusChange(String(usuario._id || usuario.id || ""), "Inativo")}
                              >
                                <UserX size={16} className="text-red-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStatusChange(String(usuario._id || usuario.id || ""), "Ativo")}
                              >
                                <UserCheck size={16} className="text-green-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal para adicionar/editar usuário */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Atualize as informações do usuário nos campos abaixo." 
                : "Preencha as informações do novo usuário nos campos abaixo."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de usuário</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Administrador">Administrador</SelectItem>
                          <SelectItem value="Funcionário">Funcionário</SelectItem>
                          <SelectItem value="Locatário">Locatário</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {editingUser ? "Nova senha (deixe em branco para manter a atual)" : "Senha"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4 gap-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90"
                >
                  {isLoading ? "Processando..." : editingUser ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
