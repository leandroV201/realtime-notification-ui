export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'


export type NotificationType =
| 'system'
| 'billing'
| 'crm'
| 'mention'
| 'deployment'
| 'security'


export type NotificationEntityType =
| 'business'
| 'proposal'
| 'invoice'
| 'user'
| 'product'
| 'system'


export type Notification = {
id: string
userId: string


title: string
message: string
level: NotificationLevel
type: NotificationType

entityType?: NotificationEntityType | null
entityId?: string | null


data?: Record<string, any> | null


readAt?: string | null
createdAt: string
}

export type ListNotificationsResponse = {
    items: Notification[]
}


export type UnreadCountResponse = {
    count: number
}