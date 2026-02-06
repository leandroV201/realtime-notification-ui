import type { Notification } from '../../types/notification'
import { NotificationItem } from './Notificationtem'


export function NotificationList({ items }: { items: Notification[] }) {
    return (
        <div className="flex flex-col gap-3">
            {items.map((n) => (
                <NotificationItem key={n.id} n={n} />
            ))}
        </div>
    )
}