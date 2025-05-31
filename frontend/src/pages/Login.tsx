import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { userService } from "@/services/userService";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: ""
  });
  
  const [registerCredentials, setRegisterCredentials] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefone: ""
  });
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await userService.login(loginCredentials.email, loginCredentials.password);
      const { token, usuario } = response.data;
      
      // Salvar token no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(usuario));
      
      // Atualizar contexto - converter ID para string
      setUser({
        id: String(usuario._id || usuario.id || ""),
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo === "Administrador" ? "admin" : "locatario"
      });
      
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo, ${usuario.nome}!`,
        duration: 3000,
      });
      
      // Redirecionar baseado no tipo de usuário
      if (usuario.tipo === "Administrador" || usuario.tipo === "Funcionário") {
        navigate("/admin");
      } else {
        navigate("/locatario");
      }
      
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.response?.data?.erro || "Email ou senha incorretos.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Verificando se as senhas conferem
    if (registerCredentials.password !== registerCredentials.confirmPassword) {
      toast({
        title: "Erro no registro",
        description: "As senhas não conferem.",
        variant: "destructive",
        duration: 3000,
      });
      setLoading(false);
      return;
    }
    
    try {
      await userService.register({
        nome: registerCredentials.nome,
        email: registerCredentials.email,
        senha: registerCredentials.password,
        telefone: registerCredentials.telefone,
        tipo: "Locatário",
        status: "Ativo"
      });
      
      toast({
        title: "Registro realizado!",
        description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        duration: 3000,
      });
      
      setIsLogin(true);
      setRegisterCredentials({
        nome: "",
        email: "",
        password: "",
        confirmPassword: "",
        telefone: ""
      });
      
    } catch (error: any) {
      console.error("Erro no registro:", error);
      toast({
        title: "Erro no registro",
        description: error.response?.data?.erro || "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Tabs defaultValue="login" onValueChange={(value) => setIsLogin(value === "login")}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login" className="text-base">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="text-base">Registrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginCredentials.email}
                      onChange={(e) => setLoginCredentials({ ...loginCredentials, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <Link to="#" className="text-sm text-imobiliaria-azul hover:underline">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        value={loginCredentials.password}
                        onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Entrando...</>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      value={registerCredentials.nome}
                      onChange={(e) => setRegisterCredentials({ ...registerCredentials, nome: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerCredentials.email}
                      onChange={(e) => setRegisterCredentials({ ...registerCredentials, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      value={registerCredentials.telefone}
                      onChange={(e) => setRegisterCredentials({ ...registerCredentials, telefone: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        value={registerCredentials.password}
                        onChange={(e) => setRegisterCredentials({ ...registerCredentials, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirme a senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="********"
                      value={registerCredentials.confirmPassword}
                      onChange={(e) => setRegisterCredentials({ ...registerCredentials, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-imobiliaria-dourado text-imobiliaria-azul hover:bg-imobiliaria-dourado/90 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Registrando...</>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Criar conta
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
