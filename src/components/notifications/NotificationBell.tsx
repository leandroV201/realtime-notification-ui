import { Bell } from 'lucide-react'
import { cn } from '../../utils/cn'
import { NotificationDropdown } from './NotificationDropdown'
import { useNotificationsStore } from '@/stores/notification.store'
import { Button } from '../ui/button'


export function NotificationBell() {
    const unread = useNotificationsStore((s) => s.unreadCount())


    return (
        <NotificationDropdown>
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />


                {unread > 0 && (
                    <span
                        className={cn(
                            'absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold',
                            'bg-foreground text-background',
                        )}
                    >
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </Button>
        </NotificationDropdown>
    )
}