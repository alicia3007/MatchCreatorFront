import { apiClient } from "./client";
import type { Company } from "../context/UserContext";

export interface ReviewResponse {
  id: string;
  from: string;
  rating: number;
  comment: string;
  date: string;
}

export const companiesService = {
  // Listar todas las empresas
  async getAll(): Promise<Company[]> {
    const { data } =
      await apiClient.get<Company[]>("/companies");
    return data;
  },

  // Obtener empresa por ID
  async getById(id: string): Promise<Company> {
    const { data } = await apiClient.get<Company>(
      `/companies/${id}`,
    );
    return data;
  },

  // Actualizar empresa — PUT
  async update(
    id: string,
    updateData: Partial<Company>,
  ): Promise<Company> {
    const { data } = await apiClient.put<Company>(
      `/companies/${id}`,
      updateData,
    );
    return data;
  },

  // Obtener reviews de una empresa
  async getReviews(id: string): Promise<ReviewResponse[]> {
    const { data } = await apiClient.get<ReviewResponse[]>(
      `/companies/${id}/reviews`,
    );
    return data;
  },

  // Agregar review a una empresa (creator autenticado)
  async addReview(
    id: string,
    reviewData: {
      from: string;
      rating: number;
      comment: string;
    },
  ): Promise<ReviewResponse> {
    const { data } = await apiClient.post<ReviewResponse>(
      `/companies/${id}/reviews`,
      reviewData,
    );
    return data;
  },

  // Listar campañas de una empresa
  async getCampaigns(
    companyId: string,
    params?: { page?: number; limit?: number },
  ): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(
      `/companies/${companyId}/campaigns`,
      { params },
    );
    return data;
  },
};