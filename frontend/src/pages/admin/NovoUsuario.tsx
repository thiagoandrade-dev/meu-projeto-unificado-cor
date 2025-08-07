// frontend/src/pages/admin/NovoUsuario.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ArrowLeft,
  Save,
  Menu,
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/apiService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios, { AxiosError } from "axios"; // Adicionado para correção

const NovoUsuario = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    perfil: "" as "admin" | "inquilino" | "proprietario" | "corretor", // Tipagem mais específica
    senha: "",
    confirmarSenha: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar campo do formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Atualizar campo select do formulário
  const handleSelectChange = (name: string, value: string) => {
    // Casting para o tipo específico de perfil
    setFormData(prev => ({ ...prev, [name]: value as typeof prev.perfil }));
    
    // Limpar erro do campo quando o usuário seleciona
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = "O nome é obrigatório";
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "O email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      newErrors.telefone = "O telefone é obrigatório";
    }
    
    // Validar perfil
    if (!formData.perfil) {
      newErrors.perfil = "O perfil é obrigatório";
    }
    
    // Validar senha
    if (!formData.senha) {
      newErrors.senha = "A senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    }
    
    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const userData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        perfil: formData.perfil,
        senha: formData.senha,
        status: 'ativo' // Por padrão, o usuário é criado como ativo
      };
      
      // Enviar requisição
      await api.post('/usuarios', userData);
      
      toast({
        title: "Usuário criado com sucesso",
        description: `O usuário ${formData.nome} foi adicionado ao sistema`,
      });
      
      // Redirecionar para a lista de usuários
      navigate('/admin/usuarios');
    } catch (error: unknown) { // Tipagem corrigida para unknown
      if (axios.isAxiosError(error)) { 
        console.error("Erro ao criar usuário:", error);
        
        // Verificar se há erros específicos retornados pela API
        if (error.response?.data?.errors) {
          const apiErrors: Record<string, string> = {};
          (error.response.data.errors as Record<string, string>[]).forEach((err) => { // Removido 'any'
            const field = Object.keys(err)[0];
            apiErrors[field] = err[field];
          });
          setErrors(apiErrors);
        } else {
          toast({
            title: "Erro ao criar usuário",
            description: error.response?.data?.message || "Não foi possível criar o usuário",
            variant: "destructive",
          });
        }
      } else { 
        console.error("Erro inesperado ao criar usuário:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao criar o usuário.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="text-xl font-semibold text-foreground">Novo Usuário</h1>
                <p className="text-sm text-muted">Adicione um novo usuário ao sistema</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/usuarios')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
            </div>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users size={20} className="mr-2 text-primary" />
                Cadastrar Novo Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm font-medium">
                      Nome completo
                    </label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleFormChange}
                      className={errors.nome ? "border-danger" : ""}
                    />
                    {errors.nome && (
                      <p className="text-sm text-danger">{errors.nome}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className={errors.email ? "border-danger" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-danger">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="telefone" className="text-sm font-medium">
                      Telefone
                    </label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleFormChange}
                      className={errors.telefone ? "border-danger" : ""}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-danger">{errors.telefone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="perfil" className="text-sm font-medium">
                      Perfil
                    </label>
                    <Select
                      value={formData.perfil}
                      onValueChange={(value) => handleSelectChange("perfil", value)}
                    >
                      <SelectTrigger className={errors.perfil ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                        <SelectItem value="proprietario">Proprietário</SelectItem>
                        <SelectItem value="corretor">Corretor</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.perfil && (
                      <p className="text-sm text-danger">{errors.perfil}</p>
                    )}
                  </div>
                </div>
                
                {/* Senha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="senha" className="text-sm font-medium">
                      Senha
                    </label>
                    <Input
                      id="senha"
                      name="senha"
                      type="password"
                      value={formData.senha}
                      onChange={handleFormChange}
                      className={errors.senha ? "border-danger" : ""}
                    />
                    {errors.senha && (
                      <p className="text-sm text-danger">{errors.senha}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="confirmarSenha" className="text-sm font-medium">
                      Confirmar senha
                    </label>
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={handleFormChange}
                      className={errors.confirmarSenha ? "border-danger" : ""}
                    />
                    {errors.confirmarSenha && (
                      <p className="text-sm text-danger">{errors.confirmarSenha}</p>
                    )}
                  </div>
                </div>
                
                {/* Alerta de segurança */}
                <Alert variant="default"> {/* Alterado de "warning" para "default" */}
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Certifique-se de usar uma senha forte e informar o usuário sobre as políticas de segurança.
                    Após o cadastro, o usuário poderá acessar o sistema com as credenciais fornecidas.
                  </AlertDescription>
                </Alert>
                
                {/* Botões de ação */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/usuarios')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Salvar</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default NovoUsuario;