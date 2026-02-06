import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { isUnread } from '../../utils/notification'
import { useNotificationsStore } from '@/stores/notification.store'


export function NotificationFilters({
    active,
    onChange,
}: {
    active: 'all' | 'unread'
    onChange: (v: 'all' | 'unread') => void
}) {
    const items = useNotificationsStore((s) => s.items)


    const unreadCount = useMemo(() => items.filter(isUnread).length, [items])


    return (
        <div className="flex items-center gap-2">
            <Button
                variant={active === 'all' ? 'default' : 'secondary'}
                onClick={() => onChange('all')}
            >
                Todas
            </Button>


            <Button
                variant={active === 'unread' ? 'default' : 'secondary'}
                onClick={() => onChange('unread')}
            >
                Não lidas
                {unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
                        {unreadCount}
                    </span>
                )}
            </Button>
        </div>
    )
}