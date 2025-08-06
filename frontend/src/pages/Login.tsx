import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { userService, AuthResponse } from "@/services/userService"; // Importar AuthResponse se definido lá
import { AxiosError } from "axios"; // Importar AxiosError se userService usa Axios

// Interface para o erro esperado da API (opcional, mas bom para tipagem)
interface ApiErrorResponse {
  erro?: string;
  erros?: { [key: string]: string }[];
}

const Login = () => {
  const [activeTab, setActiveTab] = useState("login"); // Alterado de isLogin para activeTab
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
  });

  // NOVO ESTADO AQUI
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response: AuthResponse = await userService.login(loginCredentials.email, loginCredentials.password);
      if (!response || !response.token || !response.usuario) {
          throw new Error("Resposta inválida da API de login.");
      }
      const { token, usuario } = response; 
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(usuario));
      
      setUser({
        id: String(usuario.id || usuario._id), 
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil 
      });
      
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo, ${usuario.nome}!`, 
        duration: 3000,
      });
      
      if (usuario.perfil === "admin") {
        navigate("/admin");
      } else {
        navigate("/locatario");
      }
      
    } catch (error) {
      console.error("Erro no login:", error);
      let errorMessage = "Email ou senha incorretos."; 
      
      const axiosError = error as AxiosError<ApiErrorResponse>; 
      if (axiosError.response?.data) {
          const data = axiosError.response.data;
          errorMessage = data.erro || (data.erros && data.erros[0] ? Object.values(data.erros[0])[0] : errorMessage);
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
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
        perfil: "inquilino" 
      });
      
      toast({
        title: "Registro realizado!",
        description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        duration: 3000,
      });
      
      setActiveTab("login"); // Volta para a aba de login
      setRegisterCredentials({ 
        nome: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setLoginCredentials(prev => ({ ...prev, email: registerCredentials.email, password: "" }));
      
    } catch (error) {
      console.error("Erro no registro:", error);
      let errorMessage = "Erro ao criar conta. Tente novamente."; 

      const axiosError = error as AxiosError<ApiErrorResponse>; 
      if (axiosError.response?.data) {
          const data = axiosError.response.data;
          errorMessage = data.erro || (data.erros && data.erros[0] ? Object.values(data.erros[0])[0] : errorMessage);
      }

      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // NOVA FUNÇÃO PARA ESQUECEU SENHA
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.requestPasswordReset(forgotPasswordEmail);
      toast({
        title: "E-mail enviado!",
        description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
        duration: 5000,
      });
      setForgotPasswordEmail(""); // Limpa o campo após o envio
      setActiveTab("login"); // Volta para a aba de login após o envio
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      let errorMessage = "Erro ao solicitar redefinição de senha. Tente novamente.";

      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        errorMessage = data.erro || (data.erros && data.erros[0] ? Object.values(data.erros[0])[0] : errorMessage);
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
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
            <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="grid grid-cols-3 w-full mb-6"> {/* ALTERADO grid-cols-2 para grid-cols-3 */}
                <TabsTrigger value="login" className="text-base">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="text-base">Registrar</TabsTrigger>
                <TabsTrigger value="forgot-password" className="text-base">Esqueceu a Senha?</TabsTrigger> {/* NOVO */}
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Senha</Label>
                      <button 
                        type="button" 
                        onClick={() => setActiveTab("forgot-password")} // Alterado para mudar para a aba de esqueceu senha
                        className="text-sm text-imobiliaria-azul hover:underline focus:outline-none"
                      >
                        Esqueceu a senha?
                      </button>
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
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
                    <Label htmlFor="register-password">Senha (mínimo 6 caracteres)</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        value={registerCredentials.password}
                        onChange={(e) => setRegisterCredentials({ ...registerCredentials, password: e.target.value })}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
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

              {/* NOVO TabsContent para Esqueceu a Senha */}
              <TabsContent value="forgot-password">
                <h2 className="text-2xl font-bold text-center mb-6">Redefinir Senha</h2>
                <p className="text-center text-gray-600 mb-6">Informe seu e-mail para receber um link de redefinição de senha.</p>
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4"> 
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Link de Redefinição"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-imobiliaria-azul hover:underline">
                    Voltar para o Login
                  </Link>
                </div>
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