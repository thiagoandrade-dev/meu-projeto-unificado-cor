// Local: frontend/src/pages/admin/Usuarios.tsx (Seu código original, agora corrigido e integrado)

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Search, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
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

// Usando o serviço e o tipo da nossa fonte de verdade.
import { usuariosService, Usuario } from "@/services/apiService";

// Schema alinhado com a interface 'Usuario' do apiService.
const userFormSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  perfil: z.enum(["admin", "inquilino"], { required_error: "O perfil é obrigatório." }),
  telefone: z.string().optional(),
  status: z.enum(["Ativo", "Inativo"]),
  senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }).optional().or(z.literal('')),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const AdminUsuarios = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<null | Usuario>(null);
  const [deletingUser, setDeletingUser] = useState<null | Usuario>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      perfil: "inquilino",
      telefone: "",
      status: "Ativo",
      senha: "",
    },
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(search.toLowerCase()) ||
      usuario.perfil.toLowerCase().includes(search.toLowerCase())
  );

  const openAddDialog = () => {
    form.reset({
        nome: "", email: "", perfil: "inquilino", telefone: "", status: "Ativo", senha: ""
    });
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: Usuario) => {
    setEditingUser(user);
    form.reset({
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      telefone: user.telefone || "",
      status: user.status,
      senha: "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (user: Usuario) => {
    setDeletingUser(user);
  };
  
  const handleStatusChange = async (id: string, newStatus: "Ativo" | "Inativo") => {
    try {
      await usuariosService.updateStatus(id, newStatus);
      toast({ title: "Status alterado", description: `Usuário agora está ${newStatus}` });
      loadUsers();
    } catch (error) {
      toast({ title: "Erro ao alterar status", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await usuariosService.delete(deletingUser._id);
      toast({ title: "Usuário removido", description: "O usuário foi removido com sucesso." });
      setDeletingUser(null);
      loadUsers();
    } catch (error) {
      toast({ title: "Erro ao remover", description: (error as Error).message, variant: "destructive" });
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        // ATUALIZAR USUÁRIO
        const updateData: Partial<Usuario> & { senha?: string } = {
          nome: data.nome,
          email: data.email,
          perfil: data.perfil,
          telefone: data.telefone,
          status: data.status,
        };
        
        if (data.senha) {
          updateData.senha = data.senha;
        }
        
        await usuariosService.update(editingUser._id, updateData);
        toast({ title: "Usuário atualizado", description: `As informações de ${data.nome} foram atualizadas.` });

      } else {
        // CRIAR NOVO USUÁRIO
        await usuariosService.create({
          nome: data.nome,
          email: data.email,
          perfil: data.perfil,
          telefone: data.telefone,
          status: data.status,
          senha: data.senha || "",
        });
        toast({ title: "Usuário criado", description: `${data.nome} foi cadastrado com sucesso.` });
      }
      
      setDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({ 
        title: editingUser ? "Erro ao atualizar" : "Erro ao cadastrar", 
        description: (error as Error).message, 
        variant: "destructive" 
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
                placeholder="Buscar usuários por nome, email ou perfil..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8"><p className="text-gray-500">Carregando usuários...</p></div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Perfil</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Registrado em</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <tr key={usuario._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{usuario.nome}</td>
                        <td className="py-3 px-4">{usuario.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                              usuario.perfil === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1)}
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
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(usuario)}>
                              <Pencil size={16} className="text-blue-600" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => openDeleteDialog(usuario)}>
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                            {usuario.status === "Ativo" ? (
                              <Button variant="outline" size="icon" onClick={() => handleStatusChange(usuario._id, "Inativo")}>
                                <UserX size={16} className="text-red-600" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="icon" onClick={() => handleStatusChange(usuario._id, "Ativo")}>
                                <UserCheck size={16} className="text-green-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">Nenhum usuário encontrado</td>
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
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl><Input placeholder="Nome do usuário" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="email@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="perfil" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de usuário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="telefone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="senha" render={({ field }) => (
                <FormItem>
                  <FormLabel>{editingUser ? "Nova senha (deixe em branco para manter a atual)" : "Senha"}</FormLabel>
                  <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="pt-4 gap-2">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" disabled={isLoading} className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                  {isLoading ? "Processando..." : editingUser ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal para confirmação de deleção */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirmar Remoção</DialogTitle>
                <DialogDescription>
                    Tem certeza que deseja remover o usuário <strong>{deletingUser?.nome}</strong>? Esta ação não pode ser desfeita.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>Remover</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
