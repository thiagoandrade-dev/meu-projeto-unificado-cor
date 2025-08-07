import { api, handleApiError, Imovel } from "./apiService";

export const imovelService = {
  getAll: async (): Promise<Imovel[]> => {
    try {
      const response = await api.get<Imovel[]>("/imoveis");
      return response.data;
    } catch (error) {
      throw handleApiError(error, "listar imóveis");
    }
  },

  getById: async (id: string): Promise<Imovel> => {
    try {
      const response = await api.get<Imovel>(`/imoveis/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `buscar imóvel ${id}`);
    }
  },

  create: async (imovel: Omit<Imovel, "_id">): Promise<Imovel> => {
    try {
      const response = await api.post<Imovel>("/imoveis", imovel);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "criar imóvel");
    }
  },

  update: async (id: string, imovel: Partial<Imovel>): Promise<Imovel> => {
    try {
      const response = await api.put<Imovel>(`/imoveis/${id}`, imovel);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `atualizar imóvel ${id}`);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/imoveis/${id}`);
    } catch (error) {
      throw handleApiError(error, `deletar imóvel ${id}`);
    }
  },
};
