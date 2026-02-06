import { http } from './http'
import type { Notification } from '../types/notification'


export type ListNotificationsResponse = {
    items: Notification[]
}


export type UnreadCountResponse = {
    count: number
}


// Agora userId vem do token de autenticação no backend
export async function listNotifications(userId: string) {
    return http<ListNotificationsResponse>(`/notifications?userId=${userId}`)
}


export async function unreadCount(userId: string) {
    return http<UnreadCountResponse>(`/notifications/unread-count?userId=${userId}`)
}


export async function markNotificationRead(id: string, userId: string) {
    return http<void>(`/notifications/${id}/read?userId=${userId}`, {
        method: 'PATCH',
    })
}


export async function markAllRead(userId: string) {
    return http<void>(`/notifications/read-all?userId=${userId}`, {
        method: 'PATCH',
    })
}