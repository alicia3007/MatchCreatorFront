import { Application } from "../context/UserContext";
import { apiClient } from "./client";

export const applicationsService = {
  // Obtener aplicación por ID
  async getById(id: string): Promise<Application> {
    const { data } = await apiClient.get<Application>(
      `/applications/${id}`,
    );
    return data;
  },

  // Crear aplicación (postular a campaña)
  async create(applicationData: {
    campaignId: string;
    creatorId: string;
    creatorName: string;
  }): Promise<Application> {
    const { data } = await apiClient.post<Application>(
      "/applications",
      applicationData,
    );
    return data;
  },

  // Obtener mis aplicaciones (creator autenticado)
  async getMine(): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>(
      "/applications/me",
    );
    return data;
  },

  // Obtener aplicaciones de un creador por ID público
  async getByCreator(
    creatorId: string,
  ): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>(
      `/creators/${creatorId}/applications`,
    );
    return data;
  },

  // Obtener applicants de una campaña (público)
  async getByCampaign(
    campaignId: string,
  ): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>(
      `/campaigns/${campaignId}/applicants`,
    );
    return data;
  },

  // Obtener aplicaciones de una campaña (company autenticada)
  async getByCampaignAuth(
    campaignId: string,
  ): Promise<Application[]> {
    const { data } = await apiClient.get<Application[]>(
      `/applications/campaign/${campaignId}`,
    );
    return data;
  },

  // Cambiar estado de aplicación
  async updateStatus(
    id: string,
    status:
      | "sent"
      | "reviewing"
      | "accepted"
      | "confirmed"
      | "rejected",
  ): Promise<Application> {
    const { data } = await apiClient.patch<Application>(
      `/applications/${id}/status`,
      { status },
    );
    return data;
  },

  // Confirmar colaboración (creator)
async confirm(id: string): Promise<Application> {
  const { data } = await apiClient.patch<Application>(
    `/applications/${id}/confirm`,
  );
  return data;
},
};