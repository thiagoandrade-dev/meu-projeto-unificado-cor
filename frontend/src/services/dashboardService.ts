import { api, handleApiError } from "./apiService";

export interface DashboardData {
  totalImoveis: number;
  totalUsuarios: number;
  totalContratos: number;
  totalJuridico: number;
  totalDisponiveis: number;
  totalAlugados: number;
  totalVendidos: number;
  totalInativos: number;
}

export const dashboardService = {
  getResumo: async (): Promise<DashboardData> => {
    try {
      const response = await api.get<DashboardData>("/dashboard/resumo");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "carregar dados do dashboard");
    }
  },
};
