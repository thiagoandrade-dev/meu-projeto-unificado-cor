import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Send, 
  Search, 
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Notificacao {
  _id?: string;
  id?: string; // Para compatibilidade com exibição
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  destinatario: string;
  destinatarioTipo: 'todos' | 'inquilinos' | 'proprietarios' | 'especifico';
  status: 'enviada' | 'pendente' | 'erro';
  dataEnvio: string;
  dataLeitura?: string;
  remetente: string;
}

const Notificacoes: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Formulário para nova notificação
  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'info' as 'info' | 'success' | 'warning' | 'error',
    destinatarioTipo: 'todos' as 'todos' | 'inquilinos' | 'proprietarios' | 'especifico',
    destinatarioEspecifico: ''
  });

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    setCarregando(true);
    try {
      // Simulando dados para demonstração
      const notificacoesSimuladas: Notificacao[] = [
        {
          _id: '1',
          id: '1',
          titulo: 'Vencimento de Contrato',
          mensagem: 'O contrato do imóvel Rua das Flores, 123 vence em 30 dias.',
          tipo: 'warning',
          destinatario: 'João Silva',
          destinatarioTipo: 'especifico',
          status: 'enviada',
          dataEnvio: '2024-01-15T10:00:00Z',
          dataLeitura: '2024-01-15T14:30:00Z',
          remetente: 'Sistema'
        },
        {
          _id: '2',
          id: '2',
          titulo: 'Pagamento Recebido',
          mensagem: 'Pagamento do aluguel de janeiro foi confirmado.',
          tipo: 'success',
          destinatario: 'Maria Santos',
          destinatarioTipo: 'especifico',
          status: 'enviada',
          dataEnvio: '2024-01-14T09:15:00Z',
          remetente: 'Sistema'
        },
        {
          _id: '3',
          id: '3',
          titulo: 'Manutenção Programada',
          mensagem: 'Manutenção do sistema será realizada no domingo às 02:00.',
          tipo: 'info',
          destinatario: 'Todos os usuários',
          destinatarioTipo: 'todos',
          status: 'pendente',
          dataEnvio: '2024-01-16T08:00:00Z',
          remetente: 'Administração'
        }
      ];
      setNotificacoes(notificacoesSimuladas);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setCarregando(false);
    }
  };

  const enviarNotificacao = async () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem) {
      alert('Título e mensagem são obrigatórios');
      return;
    }

    try {
      const notificacao: Notificacao = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        titulo: novaNotificacao.titulo,
        mensagem: novaNotificacao.mensagem,
        tipo: novaNotificacao.tipo,
        destinatario: novaNotificacao.destinatarioTipo === 'especifico' 
          ? novaNotificacao.destinatarioEspecifico 
          : `Todos (${novaNotificacao.destinatarioTipo})`,
        destinatarioTipo: novaNotificacao.destinatarioTipo,
        status: 'enviada',
        dataEnvio: new Date().toISOString(),
        remetente: 'Admin'
      };

      setNotificacoes(prev => [notificacao, ...prev]);
      setNovaNotificacao({
        titulo: '',
        mensagem: '',
        tipo: 'info',
        destinatarioTipo: 'todos',
        destinatarioEspecifico: ''
      });
      setDialogAberto(false);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  const notificacoesFiltradas = notificacoes.filter(notificacao => {
    const matchBusca = notificacao.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      notificacao.mensagem.toLowerCase().includes(busca.toLowerCase()) ||
                      notificacao.destinatario.toLowerCase().includes(busca.toLowerCase());
    
    const matchTipo = filtroTipo === 'todos' || notificacao.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || notificacao.status === filtroStatus;
    
    return matchBusca && matchTipo && matchStatus;
  });

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'erro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
                <p className="text-gray-600">Gerencie e envie notificações para usuários</p>
              </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Nova Notificação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enviar Nova Notificação</DialogTitle>
              <DialogDescription>
                Crie e envie uma notificação para os usuários selecionados.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novaNotificacao.titulo}
                  onChange={(e) => setNovaNotificacao(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Digite o título da notificação"
                />
              </div>
              
              <div>
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  value={novaNotificacao.mensagem}
                  onChange={(e) => setNovaNotificacao(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Digite a mensagem da notificação"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={novaNotificacao.tipo}
                  onValueChange={(value: string) => setNovaNotificacao(prev => ({ ...prev, tipo: value as 'info' | 'success' | 'warning' | 'error' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="destinatario">Destinatário</Label>
                <Select
                  value={novaNotificacao.destinatarioTipo}
                  onValueChange={(value: string) => setNovaNotificacao(prev => ({ ...prev, destinatarioTipo: value as 'todos' | 'inquilinos' | 'proprietarios' | 'especifico' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os usuários</SelectItem>
                    <SelectItem value="inquilinos">Apenas inquilinos</SelectItem>
                    <SelectItem value="proprietarios">Apenas proprietários</SelectItem>
                    <SelectItem value="especifico">Usuário específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {novaNotificacao.destinatarioTipo === 'especifico' && (
                <div>
                  <Label htmlFor="destinatarioEspecifico">Email do usuário</Label>
                  <Input
                    id="destinatarioEspecifico"
                    value={novaNotificacao.destinatarioEspecifico}
                    onChange={(e) => setNovaNotificacao(prev => ({ ...prev, destinatarioEspecifico: e.target.value }))}
                    placeholder="Digite o email do usuário"
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={enviarNotificacao}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar notificações..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="erro">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {carregando ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Carregando notificações...</p>
              </div>
            </CardContent>
          </Card>
        ) : notificacoesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Nenhuma notificação encontrada</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notificacoesFiltradas.map((notificacao) => (
            <Card key={notificacao._id || notificacao.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getIconeTipo(notificacao.tipo)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notificacao.titulo}</h3>
                        <Badge className={getCorStatus(notificacao.status)}>
                          {notificacao.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{notificacao.mensagem}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {notificacao.destinatario}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(notificacao.dataEnvio).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(notificacao.dataEnvio).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {notificacao.dataLeitura && (
                          <div className="text-green-600">
                            Lida em {new Date(notificacao.dataLeitura).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notificacoes;