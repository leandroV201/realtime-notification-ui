import type { ListNotificationsResponse, UnreadCountResponse } from '../types/notification'
import apiClient from './http';

export async function listNotifications() {
  const response = await apiClient.get<ListNotificationsResponse>('/notifications');
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
