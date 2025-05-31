
import axios from 'axios';

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

// Classe de serviço para integração com o Asaas
class AsaasService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Em produção, essas informações viriam de variáveis de ambiente
    this.baseUrl = 'https://sandbox.asaas.com/api/v3';
    this.apiKey = 'seu_token_asaas'; // Isso deve vir de uma variável de ambiente
  }

  // Configuração para as requisições HTTP
  private getConfig() {
    return {
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json'
      }
    };
  }

  // Busca os boletos de um cliente
  async getBoletos(clienteId: string): Promise<Boleto[]> {
    try {
      // Em ambiente de desenvolvimento, retornamos dados fictícios
      if (process.env.NODE_ENV === 'development') {
        return this.getMockBoletos();
      }

      // Em produção, faríamos a requisição real
      const response = await axios.get(
        `${this.baseUrl}/payments?customer=${clienteId}`,
        this.getConfig()
      );
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar boletos:', error);
      return this.getMockBoletos();
    }
  }

  // Baixa um boleto específico
  async downloadBoleto(boletoId: string): Promise<Blob> {
    try {
      // Em ambiente real, faríamos o download do boleto
      const response = await axios.get(
        `${this.baseUrl}/payments/${boletoId}/bankSlipBarCode`,
        {
          ...this.getConfig(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar boleto:', error);
      throw new Error('Não foi possível baixar o boleto');
    }
  }

  // Busca os contratos de um cliente
  async getContratos(clienteId: string): Promise<Contrato[]> {
    try {
      // Em produção, faríamos uma requisição real aos contratos
      // Como o Asaas não possui endpoint específico para contratos, 
      // isso provavelmente será uma customização ou outra API
      
      // Por enquanto, retornamos dados fictícios
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

  // Retorna boletos fictícios para teste
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
}

export default new AsaasService();
