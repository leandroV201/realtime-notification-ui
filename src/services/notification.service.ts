import type { ListNotificationsResponse, UnreadCountResponse } from '../types/notification'
import apiClient from './http';

// ✅ SEGURANÇA: userId não é passado na query, é extraído do JWT no backend
export async function listNotifications(page: number = 1, limit: number = 20) {
  const response = await apiClient.get<ListNotificationsResponse>(
    `/notifications?page=${page}&limit=${limit}`
  );
  return response.data;
}

export async function unreadCount() {
  const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  return response.data;
}

export async function markNotificationRead(id: string) {
  const response = await apiClient.patch<void>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllRead() {
  const response = await apiClient.patch<void>('/notifications/read-all');
  return response.data;
}

export async function deleteNotification(id: string) {
  const response = await apiClient.delete<void>(`/notifications/${id}`);
  return response.data;
}
