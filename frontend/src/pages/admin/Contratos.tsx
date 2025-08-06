import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Search, FileText, Eye, Download, Trash2, Calendar, DollarSign, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import contratoService, { Contrato } from "@/services/contratoService";
import { imoveisService, Usuario, Imovel } from "@/services/apiService";

// Tipo para o formulário, omitindo algumas propriedades, e ajustando imovel e inquilino para aceitar só os campos usados
type FormDataType = Omit<
  Contrato, 
  "_id" | "createdAt" | "updatedAt" | "pagamentos" | 
  "valorAluguel" | "valorCondominio" | "valorIPTU" | "diaVencimento"
> & {
  valorAluguel: string | number;
  valorCondominio: string | number;
  valorIPTU: string | number;
  diaVencimento: string | number;

  imovel: Pick<Imovel, "_id" | "grupo" | "bloco" | "apartamento">;
  inquilino: Pick<Usuario, "_id" | "nome" | "email" | "telefone" | "cpf" | "rg" | "perfil" | "status">;
};

const INITIAL_FORM_DATA: FormDataType = {
  numero: "",
  inquilino: {
    _id: "",
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    perfil: "inquilino", // certo
    status: "Ativo"
  },
  imovel: {
    _id: "",
    grupo: "",
    bloco: "",
    apartamento: ""
  },
  dataInicio: "",
  dataFim: "",
  valorAluguel: "",
  valorCondominio: "",
  valorIPTU: "",
  diaVencimento: "",
  status: "Ativo",
  observacoes: ""
};

const AdminContratos = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContratoId, setEditingContratoId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormDataType>(INITIAL_FORM_DATA);

  const carregarContratos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contratoService.getAll();
      setContratos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      setContratos([]); // Garantir que seja sempre um array
      toast({
        title: "Erro ao carregar contratos",
        description: error instanceof Error ? error.message : "Não foi possível carregar a lista de contratos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const carregarImoveis = useCallback(async () => {
    try {
      const data = await imoveisService.getAll();
      setImoveis(data.filter(imovel => imovel.statusAnuncio === "Disponível")); 
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    }
  }, []);

  useEffect(() => {
    carregarContratos();
    carregarImoveis();
  }, [carregarContratos, carregarImoveis]);

  const contratosFiltrados = (Array.isArray(contratos) ? contratos : []).filter(
    (contrato) =>
      contrato.numero.toLowerCase().includes(search.toLowerCase()) ||
      contrato.inquilino.nome.toLowerCase().includes(search.toLowerCase()) ||
      `${contrato.imovel.grupo} ${contrato.imovel.bloco} ${contrato.imovel.apartamento}`.toLowerCase().includes(search.toLowerCase())
  );

  // Atualiza campos aninhados (inquilino, imovel)
  const handleNestedChange = <K extends keyof FormDataType, CK extends keyof FormDataType[K]>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    parentKey: K,
    childKey: CK
  ) => {
    const { value } = e.target;
    setFormData(prev => {
      const parentObject = prev[parentKey];
      if (typeof parentObject === 'object' && parentObject !== null) {
        return {
          ...prev,
          [parentKey]: {
            ...parentObject,
            [childKey]: value
          }
        };
      } 
      console.warn(`Tentativa de atualizar chave aninhada em ${String(parentKey)} que não é um objeto.`);
      return prev;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    fieldName?: keyof FormDataType | string
  ) => {
    if (typeof e === "string") {
      if (fieldName) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: e as Contrato["status"]
        }));
      }
    } else {
      const { id, value } = e.target;
      const key = id as keyof FormDataType;
      setFormData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    // Formata dados convertendo string para número onde necessário
    const dataToSend: Contrato = {
        ...formData,
        valorAluguel: Number(formData.valorAluguel) || 0,
        valorCondominio: Number(formData.valorCondominio) || 0,
        valorIPTU: Number(formData.valorIPTU) || 0,
        diaVencimento: Number(formData.diaVencimento) || 5,
        imovel: {
          _id: formData.imovel._id || "",
          grupo: formData.imovel.grupo,
          bloco: formData.imovel.bloco,
          apartamento: formData.imovel.apartamento
        },
        inquilino: {
          _id: formData.inquilino._id || "",
          nome: formData.inquilino.nome,
          email: formData.inquilino.email,
          telefone: formData.inquilino.telefone,
          cpf: formData.inquilino.cpf,
          rg: formData.inquilino.rg,
          perfil: formData.inquilino.perfil,
          status: formData.inquilino.status
        }
    };

    try {
      if (editingContratoId) {
        await contratoService.update(editingContratoId, dataToSend);
        toast({
          title: "Contrato atualizado",
          description: "Contrato atualizado com sucesso",
        });
      } else {
        await contratoService.create(dataToSend);
        toast({
          title: "Contrato criado",
          description: "Contrato criado com sucesso",
        });
      }
      
      setDialogOpen(false);
      resetForm();
      carregarContratos();
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
      toast({
        title: "Erro ao salvar contrato",
        description: error instanceof Error ? error.message : "Não foi possível salvar o contrato. Verifique os dados.",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingContratoId(null);
  };

  const handleEdit = (contrato: Contrato) => {
    setFormData({
      numero: contrato.numero,
      inquilino: contrato.inquilino,
      imovel: contrato.imovel,
      dataInicio: contrato.dataInicio.split("T")[0],
      dataFim: contrato.dataFim.split("T")[0],
      valorAluguel: contrato.valorAluguel,
      valorCondominio: contrato.valorCondominio || "",
      valorIPTU: contrato.valorIPTU || "",
      diaVencimento: contrato.diaVencimento,
      status: contrato.status,
      observacoes: contrato.observacoes || ""
    });
    setEditingContratoId(contrato._id || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.")) {
      try {
        await contratoService.delete(id);
        toast({
          title: "Contrato excluído",
          description: "Contrato excluído com sucesso",
        });
        carregarContratos();
      } catch (error) {
        console.error("Erro ao excluir contrato:", error);
        toast({
          title: "Erro ao excluir contrato",
          description: error instanceof Error ? error.message : "Não foi possível excluir o contrato.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGerarPagamentos = async (contratoId: string) => {
     toast({ title: "Funcionalidade Pendente", description: "Gerar pagamentos ainda não implementado.", variant: "default" });
     console.warn("Gerar pagamentos para", contratoId);
  };

  const handleEnviarCobranca = async (contrato: Contrato) => {
     toast({ title: "Funcionalidade Pendente", description: `Enviar cobrança para ${contrato.inquilino.email} ainda não implementado.`, variant: "default" });
     console.warn("Enviar cobrança para", contrato.inquilino.email);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Contratos</h1>
            <p className="text-gray-600">Cadastre e gerencie os contratos de locação</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(isOpen) => { 
              setDialogOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
            <DialogTrigger asChild>
              <Button 
                className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2"
                onClick={resetForm}
              >
                <Plus size={16} />
                Novo Contrato
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingContratoId ? "Editar Contrato" : "Novo Contrato"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <fieldset className="border p-4 rounded-md">
                  <legend className="text-sm font-medium px-1">Informações Gerais</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="numero">Número do Contrato</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => handleChange(e, "numero")}
                        placeholder="Ex: C-2024-001"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: string) => handleChange(value, "status")}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                  <legend className="text-sm font-medium px-1">Dados do Inquilino</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label htmlFor="inquilino-nome">Nome Completo</Label>
                      <Input
                        id="inquilino-nome"
                        value={formData.inquilino.nome}
                        onChange={(e) => handleNestedChange<'inquilino', 'nome'>(e, "inquilino", "nome")}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inquilino-email">Email</Label>
                      <Input
                        id="inquilino-email"
                        type="email"
                        value={formData.inquilino.email}
                        onChange={(e) => handleNestedChange<'inquilino', 'email'>(e, "inquilino", "email")}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-1">
                      <Label htmlFor="inquilino-telefone">Telefone</Label>
                      <Input
                        id="inquilino-telefone"
                        value={formData.inquilino.telefone}
                        onChange={(e) => handleNestedChange<'inquilino', 'telefone'>(e, "inquilino", "telefone")}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inquilino-cpf">CPF</Label>
                      <Input
                        id="inquilino-cpf"
                        value={formData.inquilino.cpf}
                        onChange={(e) => handleNestedChange<'inquilino', 'cpf'>(e, "inquilino", "cpf")}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="inquilino-rg">RG</Label>
                      <Input
                        id="inquilino-rg"
                        value={formData.inquilino.rg}
                        onChange={(e) => handleNestedChange<'inquilino', 'rg'>(e, "inquilino", "rg")}
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                   <legend className="text-sm font-medium px-1">Dados do Imóvel</legend>
                   <div className="space-y-1">
                    <Label htmlFor="imovel-id">Selecionar Imóvel</Label>
                    <Select 
                      value={formData.imovel._id} 
                      onValueChange={(value) => {
                        const imovelSelecionado = imoveis.find(i => i._id === value);
                        if (imovelSelecionado) {
                          setFormData({
                            ...formData, 
                            imovel: {
                              _id: imovelSelecionado._id || "",
                              grupo: imovelSelecionado.grupo,
                              bloco: imovelSelecionado.bloco,
                              apartamento: imovelSelecionado.apartamento
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="imovel-id">
                        <SelectValue placeholder="Selecione um imóvel disponível" />
                      </SelectTrigger>
                      <SelectContent>
                        {imoveis.length === 0 && <p className="p-2 text-sm text-gray-500">Nenhum imóvel disponível.</p>}
                        {imoveis.map((imovel) => (
                          <SelectItem key={imovel._id} value={imovel._id || ""}>
                            {`G${imovel.grupo}-B${imovel.bloco}-Apto${imovel.apartamento} (${imovel.statusAnuncio})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.imovel._id && <p className="text-xs text-gray-600 mt-1">Grupo {formData.imovel.grupo} - Bloco {formData.imovel.bloco} - Apto {formData.imovel.apartamento}</p>}
                  </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                   <legend className="text-sm font-medium px-1">Datas e Valores</legend>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) => handleChange(e, "dataInicio")}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dataFim">Data de Término</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={formData.dataFim}
                        onChange={(e) => handleChange(e, "dataFim")}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="valorAluguel">Aluguel (R$)</Label>
                      <Input
                        id="valorAluguel"
                        type="number"
                        step="0.01"
                        value={formData.valorAluguel}
                        onChange={(e) => handleChange(e, "valorAluguel")}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="valorCondominio">Condomínio (R$)</Label>
                      <Input
                        id="valorCondominio"
                        type="number"
                        step="0.01"
                        value={formData.valorCondominio}
                        onChange={(e) => handleChange(e, "valorCondominio")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="valorIPTU">IPTU (R$)</Label>
                      <Input
                        id="valorIPTU"
                        type="number"
                        step="0.01"
                        value={formData.valorIPTU}
                        onChange={(e) => handleChange(e, "valorIPTU")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="diaVencimento">Dia Vencimento</Label>
                      <Input
                        id="diaVencimento"
                        type="number"
                        min="1" max="31"
                        value={formData.diaVencimento}
                        onChange={(e) => handleChange(e, "diaVencimento")}
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="space-y-1">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleChange(e, "observacoes")}
                    placeholder="Detalhes adicionais, cláusulas específicas, etc."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                     <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" disabled={loadingSubmit} className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90">
                    {loadingSubmit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingContratoId ? "Salvar Alterações" : "Criar Contrato"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por número, inquilino ou endereço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full sm:w-72"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-3 font-medium">Número</th>
                  <th className="p-3 font-medium">Inquilino</th>
                  <th className="p-3 font-medium">Imóvel</th>
                  <th className="p-3 font-medium">Vigência</th>
                  <th className="p-3 font-medium">Valor Total</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">Carregando contratos...</td>
                  </tr>
                ) : contratosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">Nenhum contrato encontrado.</td>
                  </tr>
                ) : (
                  contratosFiltrados.map((contrato) => (
                    <tr key={contrato._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{contrato.numero}</td>
                      <td className="p-3">{contrato.inquilino.nome}</td>
                      <td className="p-3">G{contrato.imovel.grupo}-B{contrato.imovel.bloco}-Apto{contrato.imovel.apartamento}</td>
                      <td className="p-3">
                        {new Date(contrato.dataInicio).toLocaleDateString("pt-BR")} - {new Date(contrato.dataFim).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3">
                        {(contrato.valorAluguel + (contrato.valorCondominio || 0) + (contrato.valorIPTU || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="p-3">
                        <Badge variant={ 
                          contrato.status === "Ativo" ? "default" : 
                          contrato.status === "Finalizado" ? "outline" : 
                          contrato.status === "Cancelado" ? "destructive" : 
                          "secondary"
                        }>
                          {contrato.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center gap-1">
                          <Button variant="ghost" size="icon" title="Visualizar/Editar" onClick={() => handleEdit(contrato)}>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Gerar Pagamentos" onClick={() => handleGerarPagamentos(contrato._id || "")}>
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </Button>
                           <Button variant="ghost" size="icon" title="Enviar Cobrança" onClick={() => handleEnviarCobranca(contrato)}>
                            <Mail className="h-4 w-4 text-yellow-600" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Excluir Contrato" onClick={() => contrato._id && handleDelete(contrato._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContratos;
