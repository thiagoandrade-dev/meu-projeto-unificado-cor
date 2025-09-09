import { api } from "./apiService";

// Interface para os dados do boleto
export interface Boleto {
  id: string;
  dateCreated: string;
  dueDate: string;
  value: number;
  description: string;
  status: string;
  invoiceUrl: string;
  bankSlipUrl: string;
  invoiceNumber: string;
}

// Interface para os dados do contrato
export interface Contrato {
  id: string;
  titulo: string;
  data: string;
  arquivo: string;
}

class AsaasService {
  // Retorna boletos fictícios para teste, exatamente igual ao seu original
  private getMockBoletos(): Boleto[] {
    const hoje = new Date();
    const mesPassado = new Date();
    mesPassado.setMonth(hoje.getMonth() - 1);
    
    const proximoMes = new Date();
    proximoMes.setMonth(hoje.getMonth() + 1);
    
    return [
      {
        id: 'pay_123456789',
        dateCreated: mesPassado.toISOString().split('T')[0],
        dueDate: mesPassado.toISOString().split('T')[0],
        value: 2500,
        description: 'Aluguel mês anterior',
        status: 'RECEIVED',
        invoiceUrl: '#',
        bankSlipUrl: '#',
        invoiceNumber: '1001'
      },
      {
        id: 'pay_987654321',
        dateCreated: hoje.toISOString().split('T')[0],
        dueDate: hoje.toISOString().split('T')[0],
        value: 2500,
        description: 'Aluguel mês atual',
        status: 'PENDING',
        invoiceUrl: '#',
        bankSlipUrl: '#',
        invoiceNumber: '1002'
      },
      {
        id: 'pay_543216789',
        dateCreated: hoje.toISOString().split('T')[0],
        dueDate: proximoMes.toISOString().split('T')[0],
        value: 2500,
        description: 'Aluguel próximo mês',
        status: 'PENDING',
        invoiceUrl: '#',
        bankSlipUrl: '#',
        invoiceNumber: '1003'
      }
    ];
  }

  // Busca os boletos via backend (rota /api/asaas/boletos/:clienteId)
  async getBoletos(clienteId: string): Promise<Boleto[]> {
    try {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockBoletos();
      }
      const response = await api.get<Boleto[]>(`/asaas/boletos/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar boletos:', error);
      return this.getMockBoletos();
    }
  }

  // Baixa boleto PDF via backend (rota /api/asaas/boletos/pdf/:boletoId)
  async downloadBoleto(boletoId: string): Promise<Blob> {
    try {
      const response = await api.get(`/asaas/boletos/pdf/${boletoId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar boleto:', error);
      throw new Error('Não foi possível baixar o boleto');
    }
  }

  // Busca contratos (mock, pois não há endpoint real)
  async getContratos(_clienteId: string): Promise<Contrato[]> {
    try {
      return [
        {
          id: 'c001',
          titulo: 'Contrato de Locação 2023',
          data: '15/01/2023',
          arquivo: '/contratos/contrato-2023.pdf'
        },
        {
          id: 'c002',
          titulo: 'Adendo de Reajuste',
          data: '20/06/2023',
          arquivo: '/contratos/adendo-reajuste.pdf'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw new Error('Não foi possível buscar os contratos');
    }
  }

  // Criar cliente no Asaas via backend
  async criarCliente(data: {
    nome: string;
    email: string;
    cpfCnpj?: string;
    celular?: string;
    inquilinoId?: string;
  }): Promise<Boleto> {
    try {
      const response = await api.post<Boleto>('/asaas/clientes', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw new Error('Erro ao criar cliente no Asaas');
    }
  }

  // Criar cobrança via backend
  async criarCobranca(data: {
    customerId: string;
    valor: number;
    vencimento: string;
    descricao: string;
  }): Promise<Boleto> {
    try {
      const response = await api.post<Boleto>('/asaas/cobrancas', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      throw new Error('Erro ao criar cobrança');
    }
  }
}

export default new AsaasService();
