import { api } from './apiService';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface TestEmailRequest {
  testEmail: string;
}

export interface ApiResponse {
  sucesso: boolean;
  mensagem: string;
  erro?: string;
}

class ConfigService {
  private baseUrl = '/config';

  // Obter configurações de e-mail
  async getEmailConfig(): Promise<EmailConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/email`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter configurações de e-mail:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao obter configurações de e-mail');
    }
  }

  // Salvar configurações de e-mail
  async saveEmailConfig(config: EmailConfig): Promise<ApiResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/email`, config);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao salvar configurações de e-mail:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao salvar configurações de e-mail');
    }
  }

  // Testar configuração de e-mail
  async testEmailConfig(testEmail: string): Promise<ApiResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/email/test`, { testEmail });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao testar configuração de e-mail:', error);
      throw new Error(error.response?.data?.erro || 'Erro ao testar configuração de e-mail');
    }
  }
}

export const configService = new ConfigService();