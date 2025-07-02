// frontend/src/pages/admin/EditarImovel.tsx
import axios, { AxiosError } from "axios"; // Adicionado para correção
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  ArrowLeft,
  Save,
  Menu,
  X,
  Upload,
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/apiService";

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

const EditarImovel = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingImovel, setLoadingImovel] = useState(true);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    operacao: "",
    preco: "",
    precoCondominio: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    areaUtil: "",
    quartos: "",
    suites: "",
    banheiros: "",
    vagas: "",
    descricao: "",
    destaque: false,
    status: "Disponível"
  });
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [novaCaracteristica, setNovaCaracteristica] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [fotosParaRemover, setFotosParaRemover] = useState<string[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do imóvel
  useEffect(() => {
    const carregarImovel = async () => {
      try {
        setLoadingImovel(true);
        const response = await api.get(`/imoveis/${id}`);
        const imovel = response.data;
        
        // Preencher formulário com dados do imóvel
        setFormData({
          titulo: imovel.titulo,
          tipo: imovel.tipo,
          operacao: imovel.operacao,
          preco: imovel.preco.toString(),
          precoCondominio: imovel.precoCondominio ? imovel.precoCondominio.toString() : "",
          endereco: imovel.endereco,
          bairro: imovel.bairro,
          cidade: imovel.cidade,
          estado: imovel.estado,
          areaUtil: imovel.areaUtil.toString(),
          quartos: imovel.quartos ? imovel.quartos.toString() : "",
          suites: imovel.suites ? imovel.suites.toString() : "",
          banheiros: imovel.banheiros ? imovel.banheiros.toString() : "",
          vagas: imovel.vagas ? imovel.vagas.toString() : "",
          descricao: imovel.descricao,
          destaque: imovel.destaque,
          status: imovel.status
        });
        
        setCaracteristicas(imovel.caracteristicas || []);
        setFotosExistentes(imovel.fotos || []);
      } catch (error) { // Removido 'any'
        if (axios.isAxiosError(error)) { // Correção da estrutura do catch
          console.error("Erro ao carregar imóvel:", error);
          toast({
            title: "Erro ao carregar imóvel",
            description: "Não foi possível carregar os dados do imóvel",
            variant: "destructive",
          });
        } else { // Adicionado tratamento para erros não-Axios
          console.error("Erro inesperado ao carregar imóvel:", error);
          toast({
            title: "Erro inesperado",
            description: "Ocorreu um erro inesperado ao carregar o imóvel.",
            variant: "destructive",
          });
        }
        navigate('/admin/imoveis');
      } finally {
        setLoadingImovel(false);
      }
    };
    
    if (id) {
      carregarImovel();
    }
  }, [id, navigate, toast]);

  // Atualizar campo do formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário seleciona
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Atualizar campo checkbox do formulário
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Adicionar característica
  const handleAddCaracteristica = () => {
    if (novaCaracteristica.trim() && !caracteristicas.includes(novaCaracteristica.trim())) {
      setCaracteristicas(prev => [...prev, novaCaracteristica.trim()]);
      setNovaCaracteristica("");
    }
  };

  // Remover característica
  const handleRemoveCaracteristica = (index: number) => {
    setCaracteristicas(prev => prev.filter((_, i) => i !== index));
  };

  // Manipular upload de fotos
  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Criar URLs para preview
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setFotos(prev => [...prev, ...filesArray]);
      setFotosPreview(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remover foto nova
  const handleRemoveFoto = (index: number) => {
    // Revogar URL do objeto para liberar memória
    URL.revokeObjectURL(fotosPreview[index]);
    
    setFotos(prev => prev.filter((_, i) => i !== index));
    setFotosPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Remover foto existente
  const handleRemoveFotoExistente = (url: string) => {
    setFotosExistentes(prev => prev.filter(foto => foto !== url));
    setFotosParaRemover(prev => [...prev, url]);
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar campos obrigatórios
    const requiredFields = [
      { name: "titulo", label: "Título" },
      { name: "tipo", label: "Tipo" },
      { name: "operacao", label: "Operação" },
      { name: "preco", label: "Preço" },
      { name: "endereco", label: "Endereço" },
      { name: "bairro", label: "Bairro" },
      { name: "cidade", label: "Cidade" },
      { name: "estado", label: "Estado" },
      { name: "areaUtil", label: "Área útil" },
      { name: "descricao", label: "Descrição" }
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field.name as keyof typeof formData]) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }
    });
    
    // Validar valores numéricos
    const numericFields = [
      { name: "preco", label: "Preço" },
      { name: "precoCondominio", label: "Preço do condomínio", required: false },
      { name: "areaUtil", label: "Área útil" },
      { name: "quartos", label: "Quartos", required: false },
      { name: "suites", label: "Suítes", required: false },
      { name: "banheiros", label: "Banheiros", required: false },
      { name: "vagas", label: "Vagas", required: false }
    ];
    
    numericFields.forEach(field => {
      const value = formData[field.name as keyof typeof formData];
      if (value && isNaN(Number(value))) {
        newErrors[field.name] = `${field.label} deve ser um número`;
      }
    });
    
    // Validar fotos
    if (fotosExistentes.length === 0 && fotos.length === 0) {
      newErrors.fotos = "Pelo menos uma foto é obrigatória";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os erros antes de continuar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const imovelData = new FormData();
      
      // Adicionar campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          imovelData.append(key, value.toString());
        }
      });
      
      // Adicionar características
      caracteristicas.forEach(caracteristica => {
        imovelData.append("caracteristicas[]", caracteristica);
      });
      
      // Adicionar fotos existentes
      imovelData.append("fotosExistentes", JSON.stringify(fotosExistentes));
      
      // Adicionar fotos para remover
      imovelData.append("fotosParaRemover", JSON.stringify(fotosParaRemover));
      
      // Adicionar novas fotos
      fotos.forEach(foto => {
        imovelData.append("fotos", foto);
      });
      
      // Enviar requisição
      await api.put(`/imoveis/${id}`, imovelData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Imóvel atualizado com sucesso",
        description: `O imóvel ${formData.titulo} foi atualizado no sistema`,
      });
      
      // Redirecionar para a lista de imóveis
      navigate('/admin/imoveis');
    } catch (error) { // Removido 'any'
      if (axios.isAxiosError(error)) { // Correção da estrutura do catch
        console.error("Erro ao atualizar imóvel:", error);
        
        // Verificar se há erros específicos retornados pela API
        if (error.response?.data?.errors) {
          const apiErrors: Record<string, string> = {};
          (error.response.data.errors as Record<string, string>[]).forEach((err) => {
            const field = Object.keys(err)[0];
            apiErrors[field] = err[field];
          });
          setErrors(apiErrors);
        } else {
          toast({
            title: "Erro ao atualizar imóvel",
            description: error.response?.data?.message || "Não foi possível atualizar o imóvel",
            variant: "destructive",
          });
        }
      } else { // Adicionado tratamento para erros não-Axios
        console.error("Erro inesperado ao atualizar imóvel:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao atualizar o imóvel.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Renderizar o componente de carregamento
  if (loadingImovel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted">Carregando dados do imóvel...</p>
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
                <h1 className="text-xl font-semibold text-foreground">Editar Imóvel</h1>
                <p className="text-sm text-muted">Atualize as informações do imóvel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/imoveis')}
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
          <form onSubmit={handleSubmit}>
            {/* Informações básicas */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Home size={20} className="mr-2 text-primary" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título <span className="text-danger">*</span></Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleFormChange}
                      className={errors.titulo ? "border-danger" : ""}
                    />
                    {errors.titulo && (
                      <p className="text-sm text-danger">{errors.titulo}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo <span className="text-danger">*</span></Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => handleSelectChange("tipo", value)}
                    >
                      <SelectTrigger className={errors.tipo ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo && (
                      <p className="text-sm text-danger">{errors.tipo}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="operacao">Operação <span className="text-danger">*</span></Label>
                    <Select
                      value={formData.operacao}
                      onValueChange={(value) => handleSelectChange("operacao", value)}
                    >
                      <SelectTrigger className={errors.operacao ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione a operação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Venda">Venda</SelectItem>
                        <SelectItem value="Aluguel">Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.operacao && (
                      <p className="text-sm text-danger">{errors.operacao}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status <span className="text-danger">*</span></Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) <span className="text-danger">*</span></Label>
                    <Input
                      id="preco"
                      name="preco"
                      value={formData.preco}
                      onChange={handleFormChange}
                      className={errors.preco ? "border-danger" : ""}
                    />
                    {errors.preco && (
                      <p className="text-sm text-danger">{errors.preco}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="precoCondominio">Preço do Condomínio (R$)</Label>
                    <Input
                      id="precoCondominio"
                      name="precoCondominio"
                      value={formData.precoCondominio}
                      onChange={handleFormChange}
                      className={errors.precoCondominio ? "border-danger" : ""}
                    />
                    {errors.precoCondominio && (
                      <p className="text-sm text-danger">{errors.precoCondominio}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => handleCheckboxChange("destaque", checked === true)}
                    />
                    <Label htmlFor="destaque">Destacar imóvel na página inicial</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Localização */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço <span className="text-danger">*</span></Label>
                    <Input
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleFormChange}
                      className={errors.endereco ? "border-danger" : ""}
                    />
                    {errors.endereco && (
                      <p className="text-sm text-danger">{errors.endereco}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro <span className="text-danger">*</span></Label>
                    <Input
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleFormChange}
                      className={errors.bairro ? "border-danger" : ""}
                    />
                    {errors.bairro && (
                      <p className="text-sm text-danger">{errors.bairro}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade <span className="text-danger">*</span></Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleFormChange}
                      className={errors.cidade ? "border-danger" : ""}
                    />
                    {errors.cidade && (
                      <p className="text-sm text-danger">{errors.cidade}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado <span className="text-danger">*</span></Label>
                    <Input
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleFormChange}
                      className={errors.estado ? "border-danger" : ""}
                    />
                    {errors.estado && (
                      <p className="text-sm text-danger">{errors.estado}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Características */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="areaUtil">Área Útil (m²) <span className="text-danger">*</span></Label>
                    <Input
                      id="areaUtil"
                      name="areaUtil"
                      value={formData.areaUtil}
                      onChange={handleFormChange}
                      className={errors.areaUtil ? "border-danger" : ""}
                    />
                    {errors.areaUtil && (
                      <p className="text-sm text-danger">{errors.areaUtil}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quartos">Quartos</Label>
                    <Input
                      id="quartos"
                      name="quartos"
                      value={formData.quartos}
                      onChange={handleFormChange}
                      className={errors.quartos ? "border-danger" : ""}
                    />
                    {errors.quartos && (
                      <p className="text-sm text-danger">{errors.quartos}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="suites">Suítes</Label>
                    <Input
                      id="suites"
                      name="suites"
                      value={formData.suites}
                      onChange={handleFormChange}
                      className={errors.suites ? "border-danger" : ""}
                    />
                    {errors.suites && (
                      <p className="text-sm text-danger">{errors.suites}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="banheiros">Banheiros</Label>
                    <Input
                      id="banheiros"
                      name="banheiros"
                      value={formData.banheiros}
                      onChange={handleFormChange}
                      className={errors.banheiros ? "border-danger" : ""}
                    />
                    {errors.banheiros && (
                      <p className="text-sm text-danger">{errors.banheiros}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vagas">Vagas de Garagem</Label>
                    <Input
                      id="vagas"
                      name="vagas"
                      value={formData.vagas}
                      onChange={handleFormChange}
                      className={errors.vagas ? "border-danger" : ""}
                    />
                    {errors.vagas && (
                      <p className="text-sm text-danger">{errors.vagas}</p>
                    )}
                  </div>
                </div>
                
                {/* Características adicionais */}
                <div className="mt-6">
                  <Label>Características adicionais</Label>
                  <div className="flex items-center mt-2">
                    <Input
                      value={novaCaracteristica}
                      onChange={(e) => setNovaCaracteristica(e.target.value)}
                      placeholder="Ex: Piscina, Churrasqueira, etc."
                      className="mr-2"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCaracteristica}
                      disabled={!novaCaracteristica.trim()}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {caracteristicas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {caracteristicas.map((caracteristica, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-primary/10 text-primary rounded-md px-3 py-1"
                        >
                          <span>{caracteristica}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCaracteristica(index)}
                            className="ml-2 text-primary hover:text-danger"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Descrição */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição detalhada <span className="text-danger">*</span></Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleFormChange}
                    className={`min-h-32 ${errors.descricao ? "border-danger" : ""}`}
                  />
                  {errors.descricao && (
                    <p className="text-sm text-danger">{errors.descricao}</p>
                    )}
                </div>
              </CardContent>
            </Card>
            
            {/* Fotos */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Fotos existentes */}
                  {fotosExistentes.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Fotos atuais</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fotosExistentes.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFotoExistente(url)}
                              className="absolute top-2 right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload de novas fotos */}
                  <div>
                    <Label className="mb-2 block">Adicionar novas fotos</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="fotos"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload size={24} className="mb-2 text-muted" />
                          <p className="mb-2 text-sm text-muted">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-muted">
                            PNG, JPG ou JPEG (máx. 5MB por arquivo)
                          </p>
                        </div>
                        <input
                          id="fotos"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFotosChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {errors.fotos && (
                    <p className="text-sm text-danger">{errors.fotos}</p>
                  )}
                  
                  {/* Preview de novas fotos */}
                  {fotosPreview.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Novas fotos</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fotosPreview.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Nova foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFoto(index)}
                              className="absolute top-2 right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Botões de ação */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/imoveis')}
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
        </main>
      </div>
    </div>
  );
};

export default EditarImovel;