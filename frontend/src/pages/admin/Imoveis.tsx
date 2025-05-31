import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Search, Pencil, Trash2, FileText, Upload, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { imoveisService, Imovel } from "@/services/apiService";

// Schema para validação do formulário
const imovelFormSchema = z.object({
  grupo: z.number().min(1, "Grupo é obrigatório"),
  bloco: z.string().min(1, "Bloco é obrigatório"),
  andar: z.number().min(0, "Andar deve ser um número válido"),
  apartamento: z.number().min(1, "Apartamento é obrigatório"),
  configuracaoPlanta: z.string().min(1, "Configuração da planta é obrigatória"),
  areaUtil: z.number().min(1, "Área útil é obrigatória"),
  numVagasGaragem: z.number().min(0, "Número de vagas deve ser válido"),
  tipoVagaGaragem: z.string().min(1, "Tipo de vaga é obrigatório"),
  preco: z.number().min(0, "Preço deve ser um valor válido"),
  statusAnuncio: z.enum(["Disponível", "Alugado", "Manutenção", "Reservado"]),
});

type ImovelFormValues = z.infer<typeof imovelFormSchema>;

const AdminImoveis = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImovel, setEditingImovel] = useState<null | Imovel>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  const form = useForm<ImovelFormValues>({
    resolver: zodResolver(imovelFormSchema),
    defaultValues: {
      grupo: 1,
      bloco: "",
      andar: 0,
      apartamento: 1,
      configuracaoPlanta: "",
      areaUtil: 0,
      numVagasGaragem: 0,
      tipoVagaGaragem: "",
      preco: 0,
      statusAnuncio: "Disponível",
    },
  });

  // Carrega os imóveis do backend
  useEffect(() => {
    loadImoveis();
  }, []);

  const loadImoveis = async () => {
    setIsLoading(true);
    try {
      const response = await imoveisService.getAll();
      setImoveis(response);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      toast({
        title: "Erro ao carregar imóveis",
        description: "Não foi possível obter a lista de imóveis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtra os imóveis com base na pesquisa
  const imoveisFiltrados = imoveis.filter(
    (imovel) =>
      `Bloco ${imovel.bloco} - Apt ${imovel.apartamento}`.toLowerCase().includes(search.toLowerCase()) ||
      imovel.configuracaoPlanta.toLowerCase().includes(search.toLowerCase()) ||
      imovel.statusAnuncio.toLowerCase().includes(search.toLowerCase())
  );

  const openAddDialog = () => {
    form.reset();
    setEditingImovel(null);
    setSelectedImages([]);
    setDialogOpen(true);
  };

  const openEditDialog = (imovel: Imovel) => {
    setEditingImovel(imovel);
    form.reset({
      grupo: imovel.grupo,
      bloco: imovel.bloco,
      andar: imovel.andar,
      apartamento: imovel.apartamento,
      configuracaoPlanta: imovel.configuracaoPlanta,
      areaUtil: imovel.areaUtil,
      numVagasGaragem: imovel.numVagasGaragem,
      tipoVagaGaragem: imovel.tipoVagaGaragem,
      preco: imovel.preco,
      statusAnuncio: imovel.statusAnuncio as "Disponível" | "Alugado" | "Manutenção" | "Reservado",
    });
    setSelectedImages([]);
    setDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este imóvel?")) return;
    
    try {
      await imoveisService.delete(id);
      
      // Recarregar lista de imóveis
      await loadImoveis();
      
      toast({
        title: "Imóvel removido",
        description: "O imóvel foi removido com sucesso",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao remover imóvel:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o imóvel",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  const onSubmit = async (data: ImovelFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Adicionar dados do imóvel ao FormData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Adicionar imagens se selecionadas
      selectedImages.forEach((image) => {
        formData.append('imagens', image);
      });
      
      if (editingImovel) {
        await imoveisService.update(editingImovel._id!, formData);
        
        toast({
          title: "Imóvel atualizado",
          description: `O imóvel Bloco ${data.bloco} - Apt ${data.apartamento} foi atualizado com sucesso`,
          duration: 3000,
        });
      } else {
        await imoveisService.create(formData);
        
        toast({
          title: "Imóvel criado",
          description: `O imóvel Bloco ${data.bloco} - Apt ${data.apartamento} foi cadastrado com sucesso`,
          duration: 3000,
        });
      }
      
      // Recarregar lista de imóveis
      await loadImoveis();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao salvar imóvel:", error);
      toast({
        title: editingImovel ? "Erro ao atualizar" : "Erro ao cadastrar",
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
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Imóveis</h1>
            <p className="text-gray-600">Cadastre e gerencie os imóveis da imobiliária</p>
          </div>
          
          <Button 
            className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2"
            onClick={openAddDialog}
          >
            <Plus size={16} />
            Novo Imóvel
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar imóveis por bloco, apartamento ou configuração..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando imóveis...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Configuração</TableHead>
                    <TableHead>Área Útil</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imoveisFiltrados.length > 0 ? (
                    imoveisFiltrados.map((imovel) => (
                      <TableRow key={imovel._id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">Grupo {imovel.grupo}</span>
                            <br />
                            <span className="text-sm text-gray-500">
                              Bloco {imovel.bloco} - Apt {imovel.apartamento}
                            </span>
                            <br />
                            <span className="text-xs text-gray-400">
                              {imovel.andar}º andar
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{imovel.configuracaoPlanta}</TableCell>
                        <TableCell>{imovel.areaUtil}m²</TableCell>
                        <TableCell>
                          {imovel.numVagasGaragem} {imovel.tipoVagaGaragem}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block py-1 px-2 rounded-full text-xs font-medium ${
                              imovel.statusAnuncio === "Disponível"
                                ? "bg-green-100 text-green-800"
                                : imovel.statusAnuncio === "Alugado"
                                ? "bg-blue-100 text-blue-800"
                                : imovel.statusAnuncio === "Reservado"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {imovel.statusAnuncio}
                          </span>
                        </TableCell>
                        <TableCell>
                          {imovel.preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(imovel)}
                            >
                              <Pencil size={16} className="text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(imovel._id!)}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <FileText size={16} className="text-gray-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
                        Nenhum imóvel encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Modal para adicionar/editar imóvel */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingImovel ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle>
            <DialogDescription>
              {editingImovel 
                ? "Atualize as informações do imóvel nos campos abaixo." 
                : "Preencha as informações do novo imóvel nos campos abaixo."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grupo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bloco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloco</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="andar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Andar</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apartamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartamento</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="101" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="configuracaoPlanta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuração da Planta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2 quartos, 1 suíte, sala, cozinha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="areaUtil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Útil (m²)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="85.50" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="2500.00" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numVagasGaragem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Vagas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipoVagaGaragem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Vaga</FormLabel>
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
                          <SelectItem value="Coberta">Coberta</SelectItem>
                          <SelectItem value="Descoberta">Descoberta</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                          <SelectItem value="Não se aplica">Não se aplica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="statusAnuncio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Anúncio</FormLabel>
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
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Alugado">Alugado</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Label htmlFor="imagens">Imagens do Imóvel</Label>
                <div className="mt-2">
                  <Input
                    id="imagens"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="cursor-pointer"
                  />
                  {selectedImages.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedImages.length} imagem(ns) selecionada(s)
                    </p>
                  )}
                </div>
              </div>
              
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
                  {isLoading ? "Processando..." : editingImovel ? "Atualizar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminImoveis;
