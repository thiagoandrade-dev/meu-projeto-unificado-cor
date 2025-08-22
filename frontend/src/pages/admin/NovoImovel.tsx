// frontend/src/pages/admin/NovoImovel.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Trash2
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
import axios, { AxiosError } from "axios";

// Definindo tipos literais para o formulário baseados no modelo backend
type ConfiguracaoPlantaType = "Padrão (2 dorms)" | "2 dorms + Despensa" | "2 dorms + Dependência" | "Padrão (3 dorms)" | "3 dorms + Dependência";
type TipoVagaGaragemType = "Coberta" | "Descoberta";
type StatusAnuncioType = "Disponível para Venda" | "Disponível para Locação";

const NovoImovel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Tipagem inicial do formData baseada no modelo backend
  const [formData, setFormData] = useState<{
    grupo: string;
    bloco: string;
    andar: string;
    apartamento: string;
    configuracaoPlanta: ConfiguracaoPlantaType | '';
    areaUtil: string;
    numVagasGaragem: string;
    tipoVagaGaragem: TipoVagaGaragemType | '';
    preco: string;
    statusAnuncio: StatusAnuncioType;
    destaque: boolean;
  }>({
    grupo: "",
    bloco: "",
    andar: "",
    apartamento: "",
    configuracaoPlanta: "",
    areaUtil: "",
    numVagasGaragem: "",
    tipoVagaGaragem: "",
    preco: "",
    statusAnuncio: "Disponível para Venda",
    destaque: false
  });
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [novaCaracteristica, setNovaCaracteristica] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Mapeamento de configuração de planta para área útil (conforme backend)
  const areasEsperadas: Record<ConfiguracaoPlantaType, number> = {
    'Padrão (2 dorms)': 82,
    '2 dorms + Despensa': 84,
    '2 dorms + Dependência': 86,
    'Padrão (3 dorms)': 125,
    '3 dorms + Dependência': 135,
  };

  // Atualizar campo select do formulário
  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => {
      // Usar casting condicional para tipos específicos ou manter como string se não for um tipo literal
      if (name === 'configuracaoPlanta') {
        const configValue = value as ConfiguracaoPlantaType | '';
        const areaUtil = configValue && areasEsperadas[configValue] ? areasEsperadas[configValue].toString() : '';
        return { ...prev, [name]: configValue, areaUtil };
      } else if (name === 'tipoVagaGaragem') {
        return { ...prev, [name]: value as TipoVagaGaragemType | '' };
      } else if (name === 'statusAnuncio') {
        return { ...prev, [name]: value as StatusAnuncioType };
      }
      return { ...prev, [name]: value }; // Para outros campos que são apenas string
    });
    
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

  // Remover foto
  const handleRemoveFoto = (index: number) => {
    // Revogar URL do objeto para liberar memória
    URL.revokeObjectURL(fotosPreview[index]);
    
    setFotos(prev => prev.filter((_, i) => i !== index));
    setFotosPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar campos obrigatórios
    const requiredFields = [
      { name: "grupo", label: "Grupo" },
      { name: "bloco", label: "Bloco" },
      { name: "andar", label: "Andar" },
      { name: "apartamento", label: "Apartamento" },
      { name: "configuracaoPlanta", label: "Configuração da Planta" },
      { name: "areaUtil", label: "Área útil" },
      { name: "preco", label: "Preço" }
    ];
    
    requiredFields.forEach(field => {
      // Acessar o valor do formData usando o 'name' do campo
      if (!formData[field.name as keyof typeof formData]) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }
    });
    
    // Validar valores numéricos
    const numericFields = [
      { name: "grupo", label: "Grupo" },
      { name: "andar", label: "Andar" },
      { name: "apartamento", label: "Apartamento" },
      { name: "areaUtil", label: "Área útil" },
      { name: "preco", label: "Preço" },
      { name: "numVagasGaragem", label: "Número de vagas", required: false }
    ];
    
    // Validações específicas do backend
    // Validar se bloco foi informado quando grupo > 0
    if (formData.grupo && Number(formData.grupo) > 0 && !formData.bloco.trim()) {
      newErrors.bloco = "Bloco é obrigatório quando grupo é informado";
    }
    
    // Validar se andar foi informado quando grupo > 0
    if (formData.grupo && Number(formData.grupo) > 0 && !formData.andar.trim()) {
      newErrors.andar = "Andar é obrigatório quando grupo é informado";
    }
    
    // Validar se área útil foi informada quando configuração da planta é informada
    if (formData.configuracaoPlanta && !formData.areaUtil.trim()) {
      newErrors.areaUtil = "Área útil é obrigatória quando configuração da planta é informada";
    }
    
    // Validar se tipo de vaga foi informado quando número de vagas > 0
    if (formData.numVagasGaragem && Number(formData.numVagasGaragem) > 0 && !formData.tipoVagaGaragem) {
      newErrors.tipoVagaGaragem = "Tipo de vaga é obrigatório quando número de vagas é informado";
    }
    
    numericFields.forEach(field => {
      const value = formData[field.name as keyof typeof formData];
      if (value && isNaN(Number(value))) {
        newErrors[field.name] = `${field.label} deve ser um número`;
      }
    });
    
    // Validar imagens
    if (fotos.length === 0) {
      newErrors.fotos = "Pelo menos uma imagem é obrigatória";
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
      
      // Preparar dados com conversões apropriadas
      const preparedData = {
        ...formData,
        grupo: parseInt(formData.grupo) || 0,
        andar: parseInt(formData.andar) || 0,
        apartamento: parseInt(formData.apartamento) || 0,
        areaUtil: parseFloat(formData.areaUtil) || 0,
        preco: parseFloat(formData.preco) || 0,
        numVagasGaragem: formData.numVagasGaragem ? parseInt(formData.numVagasGaragem) : undefined
      };
      
      // Adicionar campos de texto
      Object.entries(preparedData).forEach(([key, value]) => {
        // Garantir que os valores sejam válidos
        if (value !== null && value !== undefined && value !== "") {
          imovelData.append(key, value.toString());
        }
      });
      
      // Adicionar fotos
      fotos.forEach(foto => {
        imovelData.append("imagens", foto);
      });
      
      // Enviar requisição
      await api.post('/imoveis', imovelData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Imóvel criado com sucesso",
        description: `O imóvel foi adicionado ao sistema`,
      });
      
      // Redirecionar para a lista de imóveis
      navigate('/admin/imoveis');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) { 
        console.error("Erro ao criar imóvel:", error);
        
        // Verificar se há erros específicos retornados pela API
        if (error.response?.data?.errors) {
          const apiErrors: Record<string, string> = {};
          (error.response.data.errors as Record<string, string>[]).forEach((err: Record<string,string>) => {
            const field = Object.keys(err)[0];
            apiErrors[field] = err[field];
          });
          setErrors(apiErrors);
        } else {
          toast({
            title: "Erro ao criar imóvel",
            description: error.response?.data?.message || "Não foi possível criar o imóvel",
            variant: "destructive",
          });
        }
      } else { 
        console.error("Erro inesperado ao criar imóvel:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao criar o imóvel.",
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
                <h1 className="text-xl font-semibold text-foreground">Novo Imóvel</h1>
                <p className="text-sm text-muted">Adicione um novo imóvel ao sistema</p>
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
            {/* Informações do Condomínio */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Home size={20} className="mr-2 text-primary" />
                  Informações do Condomínio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="grupo">Grupo <span className="text-danger">*</span></Label>
                    <Input
                      id="grupo"
                      name="grupo"
                      type="number"
                      value={formData.grupo}
                      onChange={handleFormChange}
                      className={errors.grupo ? "border-danger" : ""}
                    />
                    {errors.grupo && (
                      <p className="text-sm text-danger">{errors.grupo}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bloco">Bloco <span className="text-danger">*</span></Label>
                    <Input
                      id="bloco"
                      name="bloco"
                      value={formData.bloco}
                      onChange={handleFormChange}
                      className={errors.bloco ? "border-danger" : ""}
                    />
                    {errors.bloco && (
                      <p className="text-sm text-danger">{errors.bloco}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="andar">Andar <span className="text-danger">*</span></Label>
                    <Input
                      id="andar"
                      name="andar"
                      type="number"
                      value={formData.andar}
                      onChange={handleFormChange}
                      className={errors.andar ? "border-danger" : ""}
                    />
                    {errors.andar && (
                      <p className="text-sm text-danger">{errors.andar}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apartamento">Apartamento <span className="text-danger">*</span></Label>
                    <Input
                      id="apartamento"
                      name="apartamento"
                      type="number"
                      value={formData.apartamento}
                      onChange={handleFormChange}
                      className={errors.apartamento ? "border-danger" : ""}
                    />
                    {errors.apartamento && (
                      <p className="text-sm text-danger">{errors.apartamento}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="configuracaoPlanta">Configuração da Planta <span className="text-danger">*</span></Label>
                    <Select
                      value={formData.configuracaoPlanta}
                      onValueChange={(value) => handleSelectChange("configuracaoPlanta", value)}
                    >
                      <SelectTrigger className={errors.configuracaoPlanta ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione a configuração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Padrão (2 dorms)">Padrão (2 dorms)</SelectItem>
                        <SelectItem value="2 dorms + Despensa">2 dorms + Despensa</SelectItem>
                        <SelectItem value="2 dorms + Dependência">2 dorms + Dependência</SelectItem>
                        <SelectItem value="Padrão (3 dorms)">Padrão (3 dorms)</SelectItem>
                        <SelectItem value="3 dorms + Dependência">3 dorms + Dependência</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.configuracaoPlanta && (
                      <p className="text-sm text-danger">{errors.configuracaoPlanta}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="statusAnuncio">Status do Anúncio</Label>
                    <Select
                      value={formData.statusAnuncio}
                      onValueChange={(value) => handleSelectChange("statusAnuncio", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponível para Venda">Disponível para Venda</SelectItem>
                        <SelectItem value="Disponível para Locação">Disponível para Locação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="destaque"
                    checked={formData.destaque}
                    onCheckedChange={(checked) => handleCheckboxChange("destaque", checked === true)}
                  />
                  <Label htmlFor="destaque">Destacar imóvel na página inicial</Label>
                </div>
              </CardContent>
            </Card>
            
            {/* Informações Financeiras */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Informações Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) <span className="text-danger">*</span></Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={handleFormChange}
                      className={errors.preco ? "border-danger" : ""}
                    />
                    {errors.preco && (
                      <p className="text-sm text-danger">{errors.preco}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="areaUtil">Área Útil (m²) <span className="text-danger">*</span></Label>
                    <Input
                      id="areaUtil"
                      name="areaUtil"
                      type="number"
                      step="0.01"
                      value={formData.areaUtil}
                      readOnly
                      className={`bg-muted ${errors.areaUtil ? "border-danger" : ""}`}
                      placeholder="Será preenchido automaticamente"
                    />
                    <p className="text-xs text-muted-foreground">A área útil é definida automaticamente com base na configuração da planta</p>
                    {errors.areaUtil && (
                      <p className="text-sm text-danger">{errors.areaUtil}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Garagem */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Garagem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="numVagasGaragem">Número de Vagas</Label>
                    <Input
                      id="numVagasGaragem"
                      name="numVagasGaragem"
                      type="number"
                      value={formData.numVagasGaragem}
                      onChange={handleFormChange}
                      className={errors.numVagasGaragem ? "border-danger" : ""}
                    />
                    {errors.numVagasGaragem && (
                      <p className="text-sm text-danger">{errors.numVagasGaragem}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoVagaGaragem">Tipo de Vaga</Label>
                    <Select
                      value={formData.tipoVagaGaragem}
                      onValueChange={(value) => handleSelectChange("tipoVagaGaragem", value)}
                    >
                      <SelectTrigger className={errors.tipoVagaGaragem ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coberta">Coberta</SelectItem>
                        <SelectItem value="Descoberta">Descoberta</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipoVagaGaragem && (
                      <p className="text-sm text-danger">{errors.tipoVagaGaragem}</p>
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
            

            
            {/* Imagens */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Removido o bloco de fotos existentes e suas referências, pois este é um NOVO imóvel */}
                  
                  {/* Upload de novas fotos */}
                  <div>
                    <Label className="mb-2 block">Adicionar imagens <span className="text-danger">*</span></Label> {/* Adicionado asterisco de obrigatório */}
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
                  
                  {fotosPreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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

export default NovoImovel;