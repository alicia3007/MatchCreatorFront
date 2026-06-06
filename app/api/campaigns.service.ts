import { apiClient } from "./client";
import type { Campaign } from "../context/UserContext";

export const campaignsService = {
  // Listar todas las campañas
  async getAll(params?: {
    creatorType?: string[];
    socialPlatform?: string[];
    status?: "active" | "closed";
    page?: number;
    limit?: number;
  }): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>("/campaigns", {
      params,
    });
    return data;
  },

  // Obtener campaña por ID
  async getById(id: string): Promise<Campaign> {
    const { data } = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return data;
  },

  // Crear nueva campaña
  // El backend asigna status internamente, por eso NO se envía aquí
  async create(
    campaignData: Omit<Campaign, "id" | "applicants" | "status">,
  ): Promise<Campaign> {
    const { data } = await apiClient.post<Campaign>(
      "/campaigns",
      campaignData,
    );
    return data;
  },

  // Actualizar campaña
  // El backend NO permite editar companyId, companyName ni status desde este endpoint
  async update(
    id: string,
    updateData: Partial<
      Omit<
        Campaign,
        "id" | "applicants" | "companyId" | "companyName" | "status"
      >
    >,
  ): Promise<Campaign> {
    const { data } = await apiClient.patch<Campaign>(
      `/campaigns/${id}`,
      updateData,
    );
    return data;
  },

  // Cambiar estado de campaña
  async updateStatus(
    id: string,
    status: "active" | "closed",
  ): Promise<Campaign> {
    const { data } = await apiClient.patch<Campaign>(
      `/campaigns/${id}/status`,
      { status },
    );
    return data;
  },

  // Listar campañas disponibles
  async getAvailable(params?: {
    creatorType?: string[];
    socialPlatform?: string[];
    page?: number;
    limit?: number;
  }): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>(
      "/campaigns/available",
      { params },
    );
    return data;
  },

  // Listar mis campañas
  async getMine(): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>("/campaigns/me");
    return data;
  },

  // Listar campañas de una empresa por ID público
  async getByCompany(companyId: string): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>(
      `/companies/${companyId}/campaigns`,
    );
    return data;
  },

  // Obtener applicants de una campaña
  async getApplicants(id: string): Promise<unknown[]> {
    const { data } = await apiClient.get<unknown[]>(
      `/campaigns/${id}/applicants`,
    );
    return data;
  },

  // Cerrar campaña
  async close(id: string): Promise<Campaign> {
    const { data } = await apiClient.delete<Campaign>(`/campaigns/${id}`);
    return data;
  },
};