import type { Notification, NotificationLevel } from '../types/notification'


export function sortNotificationsDesc(a: Notification, b: Notification) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}


export function isUnread(n: Notification) {
    return !n.readAt
}


export function levelToLabel(level: NotificationLevel) {
    switch (level) {
        case 'success':
            return 'Sucesso'
        case 'warning':
            return 'Atenção'
        case 'error':
            return 'Erro'
        default:
            return 'Info'
    }
}