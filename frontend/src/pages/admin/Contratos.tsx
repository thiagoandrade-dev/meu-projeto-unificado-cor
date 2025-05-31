
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Search, FileText, Eye, Download, Trash2, Calendar, DollarSign, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import contratoService, { Contrato } from "@/services/contratoService";
import { imoveisService, Imovel } from "@/services/apiService";

type FormDataType = {
  numero: string;
  inquilino: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    rg: string;
  };
  imovel: {
    id: string;
    endereco: string;
    bairro: string;
    cidade: string;
  };
  dataInicio: string;
  dataFim: string;
  valorAluguel: number;
  valorCondominio: number;
  valorIPTU: number;
  diaVencimento: number;
  status: "Ativo" | "Finalizado" | "Cancelado" | "Pendente";
  observacoes: string;
};

const AdminContratos = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormDataType>({
    numero: "",
    inquilino: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      rg: ""
    },
    imovel: {
      id: "",
      endereco: "",
      bairro: "",
      cidade: ""
    },
    dataInicio: "",
    dataFim: "",
    valorAluguel: 0,
    valorCondominio: 0,
    valorIPTU: 0,
    diaVencimento: 5,
    status: "Ativo",
    observacoes: ""
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarContratos();
    carregarImoveis();
  }, []);

  const carregarContratos = async () => {
    setLoading(true);
    try {
      const data = await contratoService.getAll();
      setContratos(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar contratos",
        description: "Não foi possível carregar os contratos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarImoveis = async () => {
    try {
      const data = await imoveisService.getAll();
      setImoveis(data);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    }
  };

  // Filtra os contratos com base na pesquisa
  const contratosFiltrados = contratos.filter(
    (contrato) =>
      contrato.numero.toLowerCase().includes(search.toLowerCase()) ||
      contrato.inquilino.nome.toLowerCase().includes(search.toLowerCase()) ||
      contrato.imovel.endereco.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingContrato) {
        await contratoService.update(editingContrato, formData);
        toast({
          title: "Contrato atualizado",
          description: "Contrato atualizado com sucesso",
        });
      } else {
        await contratoService.create(formData);
        toast({
          title: "Contrato criado",
          description: "Contrato criado com sucesso",
        });
      }
      
      setDialogOpen(false);
      resetForm();
      carregarContratos();
    } catch (error) {
      toast({
        title: "Erro ao salvar contrato",
        description: "Não foi possível salvar o contrato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      inquilino: {
        nome: "",
        email: "",
        telefone: "",
        cpf: "",
        rg: ""
      },
      imovel: {
        id: "",
        endereco: "",
        bairro: "",
        cidade: ""
      },
      dataInicio: "",
      dataFim: "",
      valorAluguel: 0,
      valorCondominio: 0,
      valorIPTU: 0,
      diaVencimento: 5,
      status: "Ativo",
      observacoes: ""
    });
    setEditingContrato(null);
  };

  const handleEdit = (contrato: Contrato) => {
    setFormData({
      numero: contrato.numero,
      inquilino: contrato.inquilino,
      imovel: contrato.imovel,
      dataInicio: contrato.dataInicio,
      dataFim: contrato.dataFim,
      valorAluguel: contrato.valorAluguel,
      valorCondominio: contrato.valorCondominio || 0,
      valorIPTU: contrato.valorIPTU || 0,
      diaVencimento: contrato.diaVencimento,
      status: contrato.status,
      observacoes: contrato.observacoes || ""
    });
    setEditingContrato(contrato._id || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      try {
        await contratoService.delete(id);
        toast({
          title: "Contrato excluído",
          description: "Contrato excluído com sucesso",
        });
        carregarContratos();
      } catch (error) {
        toast({
          title: "Erro ao excluir contrato",
          description: "Não foi possível excluir o contrato",
          variant: "destructive",
        });
      }
    }
  };

  const handleGerarPagamentos = async (contratoId: string) => {
    try {
      await contratoService.gerarPagamentos(contratoId, 12);
      toast({
        title: "Pagamentos gerados",
        description: "Os pagamentos foram gerados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar pagamentos",
        description: "Não foi possível gerar os pagamentos",
        variant: "destructive",
      });
    }
  };

  const handleEnviarCobranca = async (contrato: Contrato) => {
    try {
      // Simular envio de email de cobrança
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Cobrança enviada",
        description: `Email de cobrança enviado para ${contrato.inquilino.email}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar cobrança",
        description: "Não foi possível enviar a cobrança",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Contratos</h1>
            <p className="text-gray-600">Cadastre e gerencie os contratos de locação</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2"
                onClick={resetForm}
              >
                <Plus size={16} />
                Novo Contrato
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContrato ? "Editar Contrato" : "Novo Contrato"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número do Contrato</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      placeholder="C-2024-001"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Dados do Inquilino</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={formData.inquilino.nome}
                        onChange={(e) => setFormData({
                          ...formData, 
                          inquilino: {...formData.inquilino, nome: e.target.value}
                        })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.inquilino.email}
                        onChange={(e) => setFormData({
                          ...formData, 
                          inquilino: {...formData.inquilino, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.inquilino.telefone}
                        onChange={(e) => setFormData({
                          ...formData, 
                          inquilino: {...formData.inquilino, telefone: e.target.value}
                        })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.inquilino.cpf}
                        onChange={(e) => setFormData({
                          ...formData, 
                          inquilino: {...formData.inquilino, cpf: e.target.value}
                        })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={formData.inquilino.rg}
                        onChange={(e) => setFormData({
                          ...formData, 
                          inquilino: {...formData.inquilino, rg: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Dados do Imóvel</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imovel">Selecionar Imóvel</Label>
                    <Select 
                      value={formData.imovel.id} 
                      onValueChange={(value) => {
                        const imovel = imoveis.find(i => i._id === value);
                        if (imovel) {
                          setFormData({
                            ...formData, 
                            imovel: {
                              id: imovel._id || "",
                              endereco: `${imovel.grupo}-${imovel.bloco}, Apto ${imovel.apartamento}`,
                              bairro: "Centro", // Adapte conforme sua estrutura
                              cidade: "São Paulo"
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        {imoveis.map((imovel) => (
                          <SelectItem key={imovel._id} value={imovel._id || ""}>
                            Grupo {imovel.grupo} - Bloco {imovel.bloco}, Apto {imovel.apartamento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Término</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorAluguel">Valor do Aluguel</Label>
                    <Input
                      id="valorAluguel"
                      type="number"
                      step="0.01"
                      value={formData.valorAluguel}
                      onChange={(e) => setFormData({...formData, valorAluguel: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valorCondominio">Valor Condomínio</Label>
                    <Input
                      id="valorCondominio"
                      type="number"
                      step="0.01"
                      value={formData.valorCondominio}
                      onChange={(e) => setFormData({...formData, valorCondominio: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valorIPTU">Valor IPTU</Label>
                    <Input
                      id="valorIPTU"
                      type="number"
                      step="0.01"
                      value={formData.valorIPTU}
                      onChange={(e) => setFormData({...formData, valorIPTU: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="diaVencimento">Dia Vencimento</Label>
                    <Input
                      id="diaVencimento"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.diaVencimento}
                      onChange={(e) => setFormData({...formData, diaVencimento: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90"
                  >
                    {loading ? "Salvando..." : editingContrato ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar contratos por número, inquilino ou imóvel..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contrato</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Inquilino</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Imóvel</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Período</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      Carregando contratos...
                    </td>
                  </tr>
                ) : contratosFiltrados.length > 0 ? (
                  contratosFiltrados.map((contrato) => (
                    <tr key={contrato._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{contrato.numero}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{contrato.inquilino.nome}</p>
                          <p className="text-xs text-gray-500">{contrato.inquilino.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{contrato.imovel.endereco}</p>
                          <p className="text-xs text-gray-500">{contrato.imovel.bairro}, {contrato.imovel.cidade}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm">{new Date(contrato.dataInicio).toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs text-gray-500">até {new Date(contrato.dataFim).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {contrato.valorAluguel.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            contrato.status === "Ativo"
                              ? "bg-green-100 text-green-800"
                              : contrato.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {contrato.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(contrato)}
                            title="Editar"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleGerarPagamentos(contrato._id || "")}
                            title="Gerar Pagamentos"
                          >
                            <Calendar size={16} className="text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEnviarCobranca(contrato)}
                            title="Enviar Cobrança"
                          >
                            <Mail size={16} className="text-orange-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(contrato._id || "")}
                            title="Excluir"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      Nenhum contrato encontrado
                    </td>
                  </tr>
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
