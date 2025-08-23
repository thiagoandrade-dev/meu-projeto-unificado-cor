// frontend/src/pages/admin/EditarImovel.tsx
import axios from "axios";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/apiService";

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
  const [imagens, setImagens] = useState<File[]>([]);
  const [imagensExistentes, setImagensExistentes] = useState<string[]>([]);
  const [imagensParaRemover, setImagensParaRemover] = useState<string[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  const [fotoPrincipalIndex, setFotoPrincipalIndex] = useState<number>(0);
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
        
        // Carregar características
        if (imovel.caracteristicas && Array.isArray(imovel.caracteristicas)) {
          setCaracteristicas(imovel.caracteristicas);
        }
        
        // Carregar imagens existentes
        if (imovel.imagens && Array.isArray(imovel.imagens)) {
          setImagensExistentes(imovel.imagens);
          // Definir a primeira imagem como principal se não houver uma definida
          if (imovel.imagens.length > 0 && imovel.fotoPrincipal) {
            const principalIndex = imovel.imagens.findIndex((img: string) => img === imovel.fotoPrincipal);
            setFotoPrincipalIndex(principalIndex >= 0 ? principalIndex : 0);
          }
        }
        
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do imóvel",
          variant: "destructive",
        });
        navigate('/admin/imoveis');
      } finally {
        setLoadingImovel(false);
      }
    };

    if (id) {
      carregarImovel();
    }
  }, [id, navigate, toast]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };



  const handleAddCaracteristica = () => {
    if (novaCaracteristica.trim() && !caracteristicas.includes(novaCaracteristica.trim())) {
      setCaracteristicas([...caracteristicas, novaCaracteristica.trim()]);
      setNovaCaracteristica("");
    }
  };

  const handleRemoveCaracteristica = (index: number) => {
    setCaracteristicas(caracteristicas.filter((_, i) => i !== index));
  };

  const handleImagensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      // Validar cada arquivo
      for (const file of filesArray) {
        // Verificar tamanho (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo "${file.name}" excede o limite de 5MB`,
            variant: "destructive",
          });
          continue;
        }
        
        // Verificar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Formato não suportado",
            description: `O arquivo "${file.name}" não é um formato de imagem válido. Use: JPEG, JPG, PNG, GIF ou WEBP`,
            variant: "destructive",
          });
          continue;
        }
        
        validFiles.push(file);
      }
      
      if (validFiles.length > 0) {
        setImagens(prev => [...prev, ...validFiles]);
        
        // Criar previews para arquivos válidos
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setImagensPreview(prev => [...prev, e.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
      
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const handleRemoveImagem = (index: number, isExistente: boolean = false) => {
    if (isExistente) {
      const imagemRemovida = imagensExistentes[index];
      setImagensParaRemover(prev => [...prev, imagemRemovida]);
      setImagensExistentes(prev => prev.filter((_, i) => i !== index));
      
      // Ajustar índice da foto principal
      if (fotoPrincipalIndex === index) {
        setFotoPrincipalIndex(0);
      } else if (fotoPrincipalIndex > index) {
        setFotoPrincipalIndex(prev => prev - 1);
      }
    } else {
      setImagens(prev => prev.filter((_, i) => i !== index));
      setImagensPreview(prev => prev.filter((_, i) => i !== index));
      
      // Ajustar índice da foto principal para novas imagens
      const totalExistentes = imagensExistentes.length;
      const indexNovasImagens = index - totalExistentes;
      if (fotoPrincipalIndex >= totalExistentes && fotoPrincipalIndex - totalExistentes === indexNovasImagens) {
        setFotoPrincipalIndex(0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const imovelData = new FormData();
      
      // Adicionar dados do formulário
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          imovelData.append(key, value);
        }
      });
      
      // Adicionar características
      if (caracteristicas.length > 0) {
        imovelData.append('caracteristicas', JSON.stringify(caracteristicas));
      }
      
      // Adicionar imagens existentes (que não foram removidas)
      if (imagensExistentes.length > 0) {
        imovelData.append('imagensExistentes', JSON.stringify(imagensExistentes));
      }
      
      // Adicionar imagens para remover
      if (imagensParaRemover.length > 0) {
        imovelData.append('imagensParaRemover', JSON.stringify(imagensParaRemover));
      }
      
      // Adicionar novas imagens
      imagens.forEach(imagem => {
        imovelData.append('imagens', imagem);
      });
      
      // Definir foto principal
      if (imagensExistentes.length > 0 || imagens.length > 0) {

        if (fotoPrincipalIndex < imagensExistentes.length) {
          imovelData.append('fotoPrincipal', imagensExistentes[fotoPrincipalIndex]);
        } else {
          imovelData.append('fotoPrincipalIndex', (fotoPrincipalIndex - imagensExistentes.length).toString());
        }
      }
      
      await api.put(`/imoveis/${id}`, imovelData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: "Sucesso",
        description: "Imóvel atualizado com sucesso!",
      });
      
      navigate('/admin/imoveis');
      
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Erro ao atualizar imóvel:', error.response?.data);
        
        if (error.response?.data?.erros) {
          setErrors(error.response.data.erros);
        }
        
        toast({
          title: "Erro",
          description: error.response?.data?.message || "Erro ao atualizar imóvel",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro inesperado ao atualizar imóvel",
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
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ease-in-out"
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
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="grupo">Grupo</Label>
                    <Select value={formData.grupo} onValueChange={(value) => handleSelectChange('grupo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(grupo => (
                          <SelectItem key={grupo} value={grupo.toString()}>
                            Grupo {grupo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.grupo && (
                      <p className="text-sm text-destructive mt-1">{errors.grupo}</p>
                    )}
                  </div>

                  {formData.grupo && parseInt(formData.grupo) % 2 !== 0 && (
                    <div>
                      <Label htmlFor="bloco">Bloco</Label>
                      <Input
                        id="bloco"
                        name="bloco"
                        value={formData.bloco}
                        onChange={handleFormChange}
                        placeholder="Ex: A, B, C"
                      />
                      {errors.bloco && (
                        <p className="text-sm text-destructive mt-1">{errors.bloco}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="andar">Andar</Label>
                    <Select value={formData.andar} onValueChange={(value) => handleSelectChange('andar', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o andar" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: formData.grupo && parseInt(formData.grupo) % 2 === 0 ? 28 : 36 }, (_, i) => i + 1).map(andar => (
                          <SelectItem key={andar} value={andar.toString()}>
                            {andar}º Andar
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.andar && (
                      <p className="text-sm text-destructive mt-1">{errors.andar}</p>
                    )}
                  </div>

                  {formData.grupo && formData.andar && (() => {
                    const grupo = parseInt(formData.grupo);
                    const andar = parseInt(formData.andar);
                    const numApartamentos = grupo % 2 === 0 ? 4 : (andar <= 28 ? 4 : 2);
                    return Array.from({ length: numApartamentos }, (_, i) => {
                      const apartamento = andar * 100 + (i + 1);
                      return (
                        <div key={apartamento}>
                          <Label htmlFor="apartamento">Apartamento</Label>
                          <Select value={formData.apartamento} onValueChange={(value) => handleSelectChange('apartamento', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o apartamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={apartamento.toString()}>
                                {apartamento}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.apartamento && (
                            <p className="text-sm text-destructive mt-1">{errors.apartamento}</p>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="configuracaoPlanta">Configuração da Planta</Label>
                    <Select value={formData.configuracaoPlanta} onValueChange={(value) => handleSelectChange('configuracaoPlanta', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a configuração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 quarto">1 quarto</SelectItem>
                        <SelectItem value="2 quartos">2 quartos</SelectItem>
                        <SelectItem value="3 quartos">3 quartos</SelectItem>
                        <SelectItem value="4 quartos">4 quartos</SelectItem>
                        <SelectItem value="Cobertura">Cobertura</SelectItem>
                        <SelectItem value="Loft">Loft</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                        <SelectItem value="Kitnet">Kitnet</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.configuracaoPlanta && (
                      <p className="text-sm text-destructive mt-1">{errors.configuracaoPlanta}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      value={formData.preco}
                      onChange={handleFormChange}
                      placeholder="Ex: 350000"
                    />
                    {errors.preco && (
                      <p className="text-sm text-destructive mt-1">{errors.preco}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do Imóvel */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Imóvel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="areaUtil">Área Útil (m²)</Label>
                    <Input
                      id="areaUtil"
                      name="areaUtil"
                      type="number"
                      value={formData.areaUtil}
                      onChange={handleFormChange}
                      placeholder="Ex: 65"
                    />
                    {errors.areaUtil && (
                      <p className="text-sm text-destructive mt-1">{errors.areaUtil}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="numVagasGaragem">Número de Vagas na Garagem</Label>
                    <Input
                      id="numVagasGaragem"
                      name="numVagasGaragem"
                      type="number"
                      value={formData.numVagasGaragem}
                      onChange={handleFormChange}
                      placeholder="Ex: 1"
                    />
                    {errors.numVagasGaragem && (
                      <p className="text-sm text-destructive mt-1">{errors.numVagasGaragem}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tipoVagaGaragem">Tipo de Vaga na Garagem</Label>
                    <Select value={formData.tipoVagaGaragem} onValueChange={(value) => handleSelectChange('tipoVagaGaragem', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coberta">Coberta</SelectItem>
                        <SelectItem value="Descoberta">Descoberta</SelectItem>
                        <SelectItem value="Box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipoVagaGaragem && (
                      <p className="text-sm text-destructive mt-1">{errors.tipoVagaGaragem}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="statusAnuncio">Status do Anúncio</Label>
                  <Select value={formData.statusAnuncio} onValueChange={(value) => handleSelectChange('statusAnuncio', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponível para Venda">Disponível para Venda</SelectItem>
                      <SelectItem value="Vendido">Vendido</SelectItem>
                      <SelectItem value="Reservado">Reservado</SelectItem>
                      <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={novaCaracteristica}
                    onChange={(e) => setNovaCaracteristica(e.target.value)}
                    placeholder="Digite uma característica"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCaracteristica();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddCaracteristica} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                
                {caracteristicas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {caracteristicas.map((caracteristica, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                        <span>{caracteristica}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCaracteristica(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Imagens do Imóvel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="imagens">Adicionar Novas Imagens</Label>
                  <Input
                    id="imagens"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagensChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, JPG, PNG, GIF ou WEBP (máx. 5MB por arquivo)
                  </p>
                  {errors.imagens && (
                    <p className="text-sm text-destructive mt-1">{errors.imagens}</p>
                  )}
                </div>
                
                {/* Imagens Existentes */}
                {imagensExistentes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Imagens Atuais</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagensExistentes.map((imagem, index) => (
                        <div key={index} className={`relative border-2 rounded-md overflow-hidden cursor-pointer transition-all ${
                          fotoPrincipalIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                        }`}>
                          <img
                            src={`http://localhost:5000/uploads/imoveis/${imagem}`}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onClick={() => setFotoPrincipalIndex(index)}
                          />
                          {fotoPrincipalIndex === index && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                              Principal
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImagem(index, true);
                            }}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/80 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Preview das Novas Imagens */}
                {imagensPreview.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Novas Imagens</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagensPreview.map((preview, index) => {
                        const globalIndex = imagensExistentes.length + index;
                        return (
                          <div key={index} className={`relative border-2 rounded-md overflow-hidden cursor-pointer transition-all ${
                            fotoPrincipalIndex === globalIndex ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                          }`}>
                            <img
                              src={preview}
                              alt={`Nova imagem ${index + 1}`}
                              className="w-full h-32 object-cover"
                              onClick={() => setFotoPrincipalIndex(globalIndex)}
                            />
                            {fotoPrincipalIndex === globalIndex && (
                              <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                                Principal
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImagem(globalIndex, false);
                              }}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/80 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/imoveis')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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