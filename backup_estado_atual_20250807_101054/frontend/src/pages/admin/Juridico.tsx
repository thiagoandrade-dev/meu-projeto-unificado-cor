// Local: frontend/src/pages/admin/Juridico.tsx (VERSÃO FINAL E COMPLETA)

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Search, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
// ✅ CORREÇÃO: Importação corrigida para usar chaves e trazer todos os tipos necessários.
import { juridicoService, DocumentoJuridico, ProcessoJuridico, NotificacaoJuridica } from "@/services/juridicoService";
import axios, { AxiosError } from "axios"; // Adicionado para correção

// Tipos explícitos para os valores dos selects, removendo o uso de 'any'
type TipoDocumento = "Contrato" | "Adendo" | "Notificação" | "Procuração" | "Distrato" | "Vistoria" | "Outros";
type StatusDocumento = "Ativo" | "Arquivado" | "Pendente";
type TipoProcesso = "Despejo" | "Cobrança" | "Danos" | "Distrato" | "Renovação" | "Outros";
type StatusProcesso = "Aberto" | "Em Andamento" | "Concluído" | "Arquivado";
type PrioridadeProcesso = "Baixa" | "Média" | "Alta" | "Urgente";

const AdminJuridico = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [documentos, setDocumentos] = useState<DocumentoJuridico[]>([]);
  const [processos, setProcessos] = useState<ProcessoJuridico[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processoDialogOpen, setProcessoDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editingProcesso, setEditingProcesso] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [docFormData, setDocFormData] = useState({
    titulo: "",
    tipo: "Contrato" as TipoDocumento,
    descricao: "",
    autor: "",
    contratoRelacionado: "",
    imovelRelacionado: "",
    status: "Ativo" as StatusDocumento,
    tags: [] as string[],
    observacoes: ""
  });

  const [processoFormData, setProcessoFormData] = useState({
    numero: "",
    tipo: "Despejo" as TipoProcesso,
    contratoId: "",
    status: "Aberto" as StatusProcesso,
    prioridade: "Média" as PrioridadeProcesso,
    descricao: "",
    advogadoResponsavel: "",
    partesEnvolvidas: '', // ✅ CORREÇÃO: Altere para um texto vazio.
    dataPrazo: "",
    documentos: [] as string[],
    valor: 0,
    observacoes: ""
  });

  const carregarDocumentos = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
      const data = await juridicoService.documentos.getAll();
      setDocumentos(data);
    } catch (error: unknown) { // Tipagem corrigida para unknown
      if (axios.isAxiosError(error)) { 
        toast({
          title: "Erro ao carregar documentos",
          description: error.message || "Não foi possível carregar os documentos",
          variant: "destructive",
        });
      } else { 
        console.error("Erro inesperado ao carregar documentos:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar os documentos.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const carregarProcessos = useCallback(async () => {
    try {
      // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
      const data = await juridicoService.processos.getAll();
      setProcessos(data);
    } catch (error: unknown) { // Tipagem corrigida para unknown
      if (axios.isAxiosError(error)) { 
        console.error("Erro ao carregar processos:", error);
        toast({
          title: "Erro ao carregar processos",
          description: error.message || "Não foi possível carregar os processos",
          variant: "destructive",
        });
      } else { 
        console.error("Erro inesperado ao carregar processos:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar os processos.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    carregarDocumentos();
    carregarProcessos();
  }, [carregarDocumentos, carregarProcessos]); // ✅ CORREÇÃO: Dependências adicionadas.

  const documentosFiltrados = documentos.filter(
    (doc) =>
      doc.titulo.toLowerCase().includes(search.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(search.toLowerCase()) ||
      (doc.autor || '').toLowerCase().includes(search.toLowerCase()) // ✅ CORREÇÃO: Tratamento de 'autor' opcional.
  );

  const processosFiltrados = processos.filter(
    (processo) =>
      processo.numero.toLowerCase().includes(search.toLowerCase()) ||
      processo.tipo.toLowerCase().includes(search.toLowerCase()) ||
      (processo.advogadoResponsavel || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', docFormData.titulo);
      formData.append('tipo', docFormData.tipo);
      formData.append('descricao', docFormData.descricao || '');
      formData.append('autor', docFormData.autor);
      formData.append('contratoRelacionado', docFormData.contratoRelacionado || '');
      formData.append('imovelRelacionado', docFormData.imovelRelacionado || '');
      formData.append('status', docFormData.status);
      formData.append('tags', JSON.stringify(docFormData.tags));
      formData.append('observacoes', docFormData.observacoes || '');
      
      if (selectedFile) {
        formData.append('arquivo', selectedFile);
      }

      if (editingDoc) {
        // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
        await juridicoService.documentos.update(editingDoc, {
          ...docFormData,
          tags: docFormData.tags
        });
        toast({
          title: "Documento atualizado",
          description: "Documento atualizado com sucesso",
        });
      } else {
        // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
        await juridicoService.documentos.create({
          titulo: docFormData.titulo,
          descricao: docFormData.descricao,
          tipoAcao: docFormData.tipo,
          status: docFormData.status,
          prioridade: "Média",
          advogadoResponsavel: docFormData.autor || "Sistema",
          contratoId: docFormData.contratoRelacionado,
          imovelId: docFormData.imovelRelacionado,
          observacoes: docFormData.observacoes,
          tags: docFormData.tags
        });
        toast({
          title: "Documento criado",
          description: "Documento criado com sucesso",
        });
      }
      
      setDialogOpen(false);
      resetDocForm();
      carregarDocumentos();
    } catch (error: unknown) { // Tipagem corrigida para unknown
      if (axios.isAxiosError(error)) { 
        toast({
          title: "Erro ao salvar documento",
          description: error.message || "Não foi possível salvar o documento",
          variant: "destructive",
        });
      } else { 
        console.error("Erro inesperado ao salvar documento:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao salvar o documento.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcessoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProcesso) {
        // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
        await juridicoService.processos.update(editingProcesso, processoFormData);
        toast({
          title: "Processo atualizado",
          description: "Processo atualizado com sucesso",
        });
      } else {
        // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
        await juridicoService.processos.create(processoFormData);
        toast({
          title: "Processo criado",
          description: "Processo criado com sucesso",
        });
      }
      
      setProcessoDialogOpen(false);
      resetProcessoForm();
      carregarProcessos();
    } catch (error: unknown) { // Tipagem corrigida para unknown
      if (axios.isAxiosError(error)) { 
        toast({
          title: "Erro ao salvar processo",
          description: error.message || "Não foi possível salvar o processo",
          variant: "destructive",
        });
      } else { 
        console.error("Erro inesperado ao salvar processo:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao salvar o processo.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetDocForm = () => {
    setDocFormData({
      titulo: "",
      tipo: "Contrato",
      descricao: "",
      autor: "",
      contratoRelacionado: "",
      imovelRelacionado: "",
      status: "Ativo",
      tags: [],
      observacoes: ""
    });
    setSelectedFile(null);
    setEditingDoc(null);
  };

  const resetProcessoForm = () => {
    setProcessoFormData({
      numero: "",
      tipo: "Despejo",
      contratoId: "",
      status: "Aberto",
      prioridade: "Média",
      descricao: "",
      advogadoResponsavel: "",
      partesEnvolvidas: '', // ✅ CORREÇÃO: Alinhe com o novo tipo.
      dataPrazo: "",
      documentos: [],
      valor: 0,
      observacoes: ""
    });
    setEditingProcesso(null);
  };

  const handleDeleteDoc = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este documento?")) {
      try {
        // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
        await juridicoService.documentos.delete(id);
        toast({
          title: "Documento excluído",
          description: "Documento excluído com sucesso",
        });
        carregarDocumentos();
      } catch (error: unknown) { // Tipagem corrigida para unknown
        if (axios.isAxiosError(error)) { 
          toast({
            title: "Erro ao excluir documento",
            description: error.message || "Não foi possível excluir o documento",
            variant: "destructive",
          });
        } else { 
          console.error("Erro inesperado ao excluir documento:", error);
          toast({
            title: "Erro inesperado",
            description: "Ocorreu um erro inesperado ao excluir o documento.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleDeleteProcesso = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este processo?")) {
      try {
        // ✅ CORREÇÃO: Chamada correta para o sub-serviço.
        await juridicoService.processos.delete(id);
        toast({
          title: "Processo excluído",
          description: "Processo excluído com sucesso",
        });
        carregarProcessos();
      } catch (error: unknown) { // Tipagem corrigida para unknown
        if (axios.isAxiosError(error)) { 
          toast({
            title: "Erro ao excluir processo",
            description: error.message || "Não foi possível excluir o processo",
            variant: "destructive",
          });
        } else { 
          console.error("Erro inesperado ao excluir processo:", error);
          toast({
            title: "Erro inesperado",
            description: "Ocorreu um erro inesperado ao excluir o processo.",
            variant: "destructive",
          });
        }
      }
    }
  };
    
  const handleDownload = (documento: DocumentoJuridico) => {
    if (!documento.arquivo) {
      toast({
        title: "Download indisponível",
        description: "Este documento não possui um arquivo para baixar.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Download iniciado",
      description: `Baixando ${documento.titulo}`,
      duration: 3000,
    });
    
    const link = document.createElement('a');
    link.href = documento.arquivo;
    link.download = `${documento.titulo.replace(/\s+/g, '_')}.${(documento.formato || 'pdf').toLowerCase()}`;
    link.click();
  };

  const enviarNotificacao = async (tipo: string, email: string) => {
    try {
      // ✅ CORREÇÃO: Chamada correta da função `send` e montagem do objeto.
      const notificacaoData: NotificacaoJuridica = {
        tipo,
        destinatario: email,
        assunto: `Notificação Jurídica sobre ${tipo}`,
        corpo: `Este é um aviso sobre o documento/processo ${tipo}.`,
        remetente: 'doc@imobiliariafirenze.com.br',
        timestamp: new Date().toISOString()
      };
      await juridicoService.notificacoes.send(notificacaoData);
      
      toast({
        title: "Notificação enviada",
        description: `Email enviado para ${email}`,
      });
    } catch (error: unknown) { // Tipagem corrigida para unknown
      if (axios.isAxiosError(error)) { 
        toast({
          title: "Erro ao enviar notificação",
          description: error.message || "Não foi possível enviar a notificação",
          variant: "destructive",
        });
      } else { 
        console.error("Erro inesperado ao enviar notificação:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao enviar a notificação.",
          variant: "destructive",
        });
      }
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Urgente": return "bg-red-100 text-red-800";
      case "Alta": return "bg-orange-100 text-orange-800";
      case "Média": return "bg-yellow-100 text-yellow-800";
      case "Baixa": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
      case "Aberto": return "bg-blue-100 text-blue-800";
      case "Em Andamento": return "bg-yellow-100 text-yellow-800";
      case "Concluído": return "bg-green-100 text-green-800";
      case "Arquivado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Departamento Jurídico</h1>
            <p className="text-gray-600">Gerencie documentos e processos jurídicos</p>
          </div>
        </div>
        
        <Tabs defaultValue="documentos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="processos">Processos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documentos">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Buscar documentos por título, tipo ou autor..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2"
                      onClick={resetDocForm}
                    >
                      <Plus size={16} />
                      Novo Documento
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDoc ? "Editar Documento" : "Novo Documento"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleDocSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="titulo">Título</Label>
                          <Input
                            id="titulo"
                            value={docFormData.titulo}
                            onChange={(e) => setDocFormData({...docFormData, titulo: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tipo">Tipo</Label>
                          <Select 
                            value={docFormData.tipo} 
                            onValueChange={(value: TipoDocumento) => setDocFormData({...docFormData, tipo: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Contrato">Contrato</SelectItem>
                              <SelectItem value="Adendo">Adendo</SelectItem>
                              <SelectItem value="Notificação">Notificação</SelectItem>
                              <SelectItem value="Procuração">Procuração</SelectItem>
                              <SelectItem value="Distrato">Distrato</SelectItem>
                              <SelectItem value="Vistoria">Vistoria</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={docFormData.descricao}
                          onChange={(e) => setDocFormData({...docFormData, descricao: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="autor">Autor</Label>
                          <Input
                            id="autor"
                            value={docFormData.autor}
                            onChange={(e) => setDocFormData({...docFormData, autor: e.target.value})}
                            placeholder="Dr. João Silva"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="status-doc">Status</Label>
                          <Select 
                            value={docFormData.status} 
                            onValueChange={(value: StatusDocumento) => setDocFormData({...docFormData, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ativo">Ativo</SelectItem>
                              {/* ✅ CORREÇÃO: Tag de fechamento corrigida. */}
                              <SelectItem value="Arquivado">Arquivado</SelectItem>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="arquivo">Arquivo</Label>
                        <Input
                          id="arquivo"
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept=".pdf,.doc,.docx"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacoes-doc">Observações</Label>
                        <Textarea
                          id="observacoes-doc"
                          value={docFormData.observacoes}
                          onChange={(e) => setDocFormData({...docFormData, observacoes: e.target.value})}
                          rows={2}
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
                          {loading ? "Salvando..." : editingDoc ? "Atualizar" : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Autor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          Carregando documentos...
                        </td>
                      </tr>
                    ) : documentosFiltrados.length > 0 ? (
                      documentosFiltrados.map((doc) => (
                        <tr key={doc._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{doc.titulo}</p>
                              <p className="text-xs text-gray-500">{doc.descricao}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-100 text-blue-800">
                              {doc.tipo}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{doc.autor}</td>
                          <td className="py-3 px-4">
                            {/* ✅ CORREÇÃO: Usando 'createdAt' que existe no tipo. */}
                            {new Date(doc.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDownload(doc)}
                                title="Download"
                              >
                                <Download size={16} className="text-green-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteDoc(doc._id || "")}
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
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          Nenhum documento encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="processos">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Buscar processos por número, tipo ou advogado..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <Dialog open={processoDialogOpen} onOpenChange={setProcessoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 flex items-center gap-2"
                      onClick={resetProcessoForm}
                    >
                      <Plus size={16} />
                      Novo Processo
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProcesso ? "Editar Processo" : "Novo Processo"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleProcessoSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="numero-processo">Número do Processo</Label>
                          <Input
                            id="numero-processo"
                            value={processoFormData.numero}
                            onChange={(e) => setProcessoFormData({...processoFormData, numero: e.target.value})}
                            placeholder="P-2024-001"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tipo-processo">Tipo</Label>
                          <Select 
                            value={processoFormData.tipo} 
                            onValueChange={(value: TipoProcesso) => setProcessoFormData({...processoFormData, tipo: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Despejo">Despejo</SelectItem>
                              <SelectItem value="Cobrança">Cobrança</SelectItem>
                              <SelectItem value="Danos">Danos</SelectItem>
                              <SelectItem value="Distrato">Distrato</SelectItem>
                              <SelectItem value="Renovação">Renovação</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status-processo">Status</Label>
                          <Select 
                            value={processoFormData.status} 
                            onValueChange={(value: StatusProcesso) => setProcessoFormData({...processoFormData, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Aberto">Aberto</SelectItem>
                              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                              <SelectItem value="Concluído">Concluído</SelectItem>
                              <SelectItem value="Arquivado">Arquivado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="prioridade">Prioridade</Label>
                          <Select 
                            value={processoFormData.prioridade} 
                            onValueChange={(value: PrioridadeProcesso) => setProcessoFormData({...processoFormData, prioridade: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baixa">Baixa</SelectItem>
                              <SelectItem value="Média">Média</SelectItem>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Urgente">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao-processo">Descrição</Label>
                        <Textarea
                          id="descricao-processo"
                          value={processoFormData.descricao}
                          onChange={(e) => setProcessoFormData({...processoFormData, descricao: e.target.value})}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="advogado">Advogado Responsável</Label>
                          <Input
                            id="advogado"
                            value={processoFormData.advogadoResponsavel}
                            onChange={(e) => setProcessoFormData({...processoFormData, advogadoResponsavel: e.target.value})}
                            placeholder="Dr. João Silva"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="data-prazo">Data Prazo</Label>
                          <Input
                            id="data-prazo"
                            type="date"
                            value={processoFormData.dataPrazo}
                            onChange={(e) => setProcessoFormData({...processoFormData, dataPrazo: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Este é um bom lugar para adicionar o campo para 'partesEnvolvidas' */}

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setProcessoDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-imobiliaria-azul hover:bg-imobiliaria-azul/90"
                        >
                          {loading ? "Salvando..." : editingProcesso ? "Atualizar" : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Processo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Advogado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Prioridade</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processosFiltrados.length > 0 ? (
                      processosFiltrados.map((processo) => (
                        <tr key={processo._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{processo.numero}</p>
                              <p className="text-xs text-gray-500">{processo.descricao.substring(0, 50)}...</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-purple-100 text-purple-800">
                              {processo.tipo}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{processo.advogadoResponsavel}</td>
                          <td className="py-3 px-4">
                            <Badge className={getPrioridadeColor(processo.prioridade)}>
                              {processo.prioridade}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(processo.status)}>
                              {processo.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteProcesso(processo._id || "")}
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
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          Nenhum processo encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminJuridico;