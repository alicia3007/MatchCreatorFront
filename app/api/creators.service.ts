import { apiClient } from "./client";
import type { Creator } from "../context/UserContext";
export interface ReviewResponse {
  id: string;
  from: string;
  rating: number;
  comment: string;
  date: string;
}

export const creatorsService = {
  // Listar todos los creadores con filtros opcionales
  async getAll(params?: {
    q?: string;
    contentType?: string[];
    platform?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    page?: number;
    limit?: number;
  }): Promise<Creator[]> {
    const { data } = await apiClient.get<Creator[]>(
      "/creators",
      { params },
    );
    return data;
  },

  // Buscar creadores con filtros
  async search(params?: {
    q?: string;
    contentType?: string[];
    platform?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    page?: number;
    limit?: number;
  }): Promise<Creator[]> {
    const { data } = await apiClient.get<Creator[]>(
      "/creators/search",
      { params },
    );
    return data;
  },

  // Obtener creador por ID
  async getById(id: string): Promise<Creator> {
    const { data } = await apiClient.get<Creator>(
      `/creators/${id}`,
    );
    return data;
  },

  // Obtener perfil público de creador
  async getPublicProfile(id: string): Promise<Creator> {
    const { data } = await apiClient.get<Creator>(
      `/creators/${id}/public`,
    );
    return data;
  },

  // Actualizar creador — PUT
  async update(
    id: string,
    updateData: Partial<Creator>,
  ): Promise<Creator> {
    const { data } = await apiClient.put<Creator>(
      `/creators/${id}`,
      updateData,
    );
    return data;
  },

  // Obtener reviews de un creador
  async getReviews(id: string): Promise<ReviewResponse[]> {
    const { data } = await apiClient.get<ReviewResponse[]>(
      `/creators/${id}/reviews`,
    );
    return data;
  },

  // Agregar review a un creador (autenticado)
  async addReview(
    id: string,
    reviewData: {
      from: string;
      rating: number;
      comment: string;
    },
  ): Promise<ReviewResponse> {
    const { data } = await apiClient.post<ReviewResponse>(
      `/creators/${id}/reviews`,
      reviewData,
    );
    return data;
  },

  // Obtener aplicaciones de un creador por ID público
  async getApplications(creatorId: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(
      `/creators/${creatorId}/applications`,
    );
    return data;
  },
};