// Local: frontend/src/pages/admin/Imoveis.tsx (Versão Final Corrigida)

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
// 1. IMPORTAR O TIPO 'Imovel' DO LOCAL CORRETO (apiService)
import { imoveisService, Imovel } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";

// A 'interface Imovel' local foi REMOVIDA daqui para evitar duplicidade.

const AdminImoveis = () => {
  const { toast } = useToast();
  // Agora os estados usam o tipo 'Imovel' importado, que é a fonte da verdade.
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadImoveis = useCallback(async () => {
    try {
      setLoading(true);
      const data = await imoveisService.getAll();
      setImoveis(data); // Não precisa mais de conversão, pois os tipos já são os mesmos.
    } catch (error) {
      toast({
        title: "Erro ao carregar imóveis",
        description: "Não foi possível buscar a lista de imóveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadImoveis();
  }, [loadImoveis]);

  // A função handleDelete já usa o tipo correto importado.
  const handleDelete = (imovel: Imovel) => {
    setImovelSelecionado(imovel);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imovelSelecionado) return;

    try {
      await imoveisService.delete(imovelSelecionado._id);
      toast({
        title: "Imóvel excluído!",
        description: "O imóvel foi removido com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setImovelSelecionado(null);
      loadImoveis();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o imóvel.",
        variant: "destructive",
      });
    }
  };

  const filteredImoveis = imoveis.filter(
    (imovel) =>
      imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Imóveis</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Imóvel
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por título, endereço, cidade..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p>Carregando imóveis...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Valor (R$)</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImoveis.map((imovel) => (
                  <TableRow key={imovel._id}>
                    <TableCell className="font-medium">{imovel.titulo}</TableCell>
                    <TableCell>{imovel.endereco}</TableCell>
                    <TableCell>{imovel.cidade}</TableCell>
                    <TableCell>{imovel.valor.toLocaleString()}</TableCell>
                    <TableCell>{imovel.tipo}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          imovel.statusAnuncio === "Disponível"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {imovel.statusAnuncio}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(imovel)}>
                            Excluir
                          </DropdownMenuItem>
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o imóvel "
              {imovelSelecionado?.titulo}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminImoveis;