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
import { api, Imovel } from "@/services/apiService";

const EditarImovel = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingImovel, setLoadingImovel] = useState(true);
  const [formData, setFormData] = useState({
    grupo: "",
    bloco: "",
    andar: "",
    apartamento: "",
    configuracaoPlanta: "",
    areaUtil: "",
    numVagasGaragem: "",
    tipoVagaGaragem: "",
    preco: "",
    statusAnuncio: "Disponível para Venda"
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
          grupo: imovel.grupo ? imovel.grupo.toString() : "",
          bloco: imovel.bloco || "",
          andar: imovel.andar ? imovel.andar.toString() : "",
          apartamento: imovel.apartamento ? imovel.apartamento.toString() : "",
          configuracaoPlanta: imovel.configuracaoPlanta || "",
          areaUtil: imovel.areaUtil ? imovel.areaUtil.toString() : "",
          numVagasGaragem: imovel.numVagasGaragem ? imovel.numVagasGaragem.toString() : "",
          tipoVagaGaragem: imovel.tipoVagaGaragem || "",
          preco: imovel.preco ? imovel.preco.toString() : "",
          statusAnuncio: imovel.statusAnuncio || "Disponível para Venda"
        });
        
        setFotosExistentes(imovel.imagens || []);
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
      { name: "grupo", label: "Grupo" },
      { name: "bloco", label: "Bloco" },
      { name: "andar", label: "Andar" },
      { name: "apartamento", label: "Apartamento" },
      { name: "configuracaoPlanta", label: "Configuração da Planta" },
      { name: "areaUtil", label: "Área útil" },
      { name: "numVagasGaragem", label: "Número de vagas" },
      { name: "tipoVagaGaragem", label: "Tipo de vaga" },
      { name: "preco", label: "Preço" }
    ];
    
    requiredFields.forEach(field => {
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
      { name: "numVagasGaragem", label: "Número de vagas" },
      { name: "preco", label: "Preço" }
    ];
    
    numericFields.forEach(field => {
      const value = formData[field.name as keyof typeof formData];
      if (value && isNaN(Number(value))) {
        newErrors[field.name] = `${field.label} deve ser um número`;
      }
    });
    
    // Validações específicas
    if (formData.grupo && Number(formData.grupo) < 12) {
      newErrors.grupo = "Grupo deve ser 12 ou maior";
    }
    
    if (formData.andar && Number(formData.andar) < 1) {
      newErrors.andar = "Andar deve ser maior que 0";
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
      
      // Adicionar fotos existentes
      imovelData.append("fotosExistentes", JSON.stringify(fotosExistentes));
      
      // Adicionar fotos para remover
      imovelData.append("fotosParaRemover", JSON.stringify(fotosParaRemover));
      
      // Adicionar novas fotos
      fotos.forEach(foto => {
        imovelData.append("imagens", foto);
      });
      
      // Enviar requisição
      await api.put(`/imoveis/${id}`, imovelData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Imóvel atualizado com sucesso",
        description: `O imóvel Grupo ${formData.grupo}, Bloco ${formData.bloco}, Apto ${formData.apartamento} foi atualizado no sistema`,
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
            {/* Informações do Condomínio */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Home size={20} className="mr-2 text-primary" />
                  Informações do Condomínio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="grupo">Grupo <span className="text-danger">*</span></Label>
                    <Input
                      id="grupo"
                      name="grupo"
                      type="number"
                      min="12"
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
                    <Select
                      value={formData.bloco}
                      onValueChange={(value) => handleSelectChange("bloco", value)}
                    >
                      <SelectTrigger className={errors.bloco ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione o bloco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
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
                      min="1"
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
                    <Label htmlFor="areaUtil">Área Útil (m²) <span className="text-danger">*</span></Label>
                    <Input
                      id="areaUtil"
                      name="areaUtil"
                      type="number"
                      value={formData.areaUtil}
                      onChange={handleFormChange}
                      className={errors.areaUtil ? "border-danger" : ""}
                    />
                    {errors.areaUtil && (
                      <p className="text-sm text-danger">{errors.areaUtil}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numVagasGaragem">Número de Vagas <span className="text-danger">*</span></Label>
                    <Input
                      id="numVagasGaragem"
                      name="numVagasGaragem"
                      type="number"
                      min="0"
                      value={formData.numVagasGaragem}
                      onChange={handleFormChange}
                      className={errors.numVagasGaragem ? "border-danger" : ""}
                    />
                    {errors.numVagasGaragem && (
                      <p className="text-sm text-danger">{errors.numVagasGaragem}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoVagaGaragem">Tipo de Vaga <span className="text-danger">*</span></Label>
                    <Select
                      value={formData.tipoVagaGaragem}
                      onValueChange={(value) => handleSelectChange("tipoVagaGaragem", value)}
                    >
                      <SelectTrigger className={errors.tipoVagaGaragem ? "border-danger" : ""}>
                        <SelectValue placeholder="Selecione o tipo de vaga" />
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) <span className="text-danger">*</span></Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      min="0"
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
                    <Label htmlFor="statusAnuncio">Status do Anúncio <span className="text-danger">*</span></Label>
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
              </CardContent>
            </Card>
            
            {/* Imagens */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Imagens existentes */}
                  {fotosExistentes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Imagens atuais:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fotosExistentes.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFotoExistente(url)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Preview das novas fotos */}
                  {fotosPreview.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Novas imagens:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fotosPreview.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Nova foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="fotos" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Adicionar novas imagens
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF até 10MB cada
                          </span>
                        </label>
                        <input
                          id="fotos"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFotosChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
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