import { apiClient } from './client';
import type { Notification } from "../context/UserContext";

export const notificationsService = {
  // Listar notificaciones del usuario actual
  async getAll(): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>('/notifications');
    return data;
  },

  // Marcar notificación como leída
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  // Marcar todas como leídas
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/mark-all-read');
  },

  // Limpiar todas las notificaciones
  async clearAll(): Promise<void> {
    await apiClient.delete('/notifications/clear');
  },
};