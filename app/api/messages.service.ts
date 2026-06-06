import { apiClient } from './client';
import type { Conversation, Message } from "../context/UserContext";

export const messagesService = {
  // ═══════════════════════════════════════════════════════════
  // CONVERSACIONES
  // ═══════════════════════════════════════════════════════════

  // Listar conversaciones del usuario actual
  async getConversations(): Promise<Conversation[]> {
    const { data } = await apiClient.get<Conversation[]>('/conversations');
    return data;
  },

  // Obtener conversación por ID
  async getConversation(id: string): Promise<Conversation> {
    const { data } = await apiClient.get<Conversation>(`/conversations/${id}`);
    return data;
  },

  // Crear nueva conversación
  async createConversation(conversationData: {
    participants: { id: string; name: string; avatar: string; type: 'creator' | 'company' | 'system' }[];
  }): Promise<Conversation> {
    const { data } = await apiClient.post<Conversation>('/conversations', conversationData);
    return data;
  },

  // Obtener o crear conversación
  async getOrCreateConversation(params: {
    currentUserId: string;
    currentUserType: 'creator' | 'company';
    otherUserId: string;
    otherUserType: 'creator' | 'company' | 'system';
  }): Promise<Conversation> {
    const { data } = await apiClient.post<Conversation>('/conversations/get-or-create', params);
    return data;
  },

  // Marcar conversación como leída
  async markAsRead(conversationId: string, id: string): Promise<void> {
    await apiClient.patch(`/conversations/${conversationId}/read`);
  },

  // ═══════════════════════════════════════════════════════════
  // MENSAJES
  // ═══════════════════════════════════════════════════════════

  // Obtener mensajes de una conversación
  async getMessages(conversationId: string, params?: { page?: number; limit?: number }): Promise<Message[]> {
    const { data } = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`, { params });
    return data;
  },

  // Enviar mensaje
  async sendMessage(messageData: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
  }): Promise<Message> {
    const { data } = await apiClient.post<Message>('/messages', messageData);
    return data;
  },

  // Crear mensaje del sistema
  async sendSystemMessage(messageData: {
    conversationId: string;
    text: string;
  }): Promise<Message> {
    const { data } = await apiClient.post<Message>('/messages/system', messageData);
    return data;
  },
};
