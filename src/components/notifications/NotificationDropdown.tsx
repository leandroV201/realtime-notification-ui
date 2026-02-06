import { PropsWithChildren, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { isUnread } from '../../utils/notification'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotificationsStore } from '@/stores/notification.store'
import { NotificationItem } from './Notificationtem'


export function NotificationDropdown({ children }: PropsWithChildren) {
    const navigate = useNavigate()


    const items = useNotificationsStore((s) => s.items)
    const markAllReadLocal = useNotificationsStore((s) => s.markAllRead)


    const preview = useMemo(() => items.slice(0, 8), [items])
    const unreadCount = useMemo(() => items.filter(isUnread).length, [items])


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>


            <DropdownMenuContent align="end" className="w-[420px] p-0">
                <div className="flex items-center justify-between px-3 py-3">
                    <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>


                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={unreadCount === 0}
                            onClick={() => markAllReadLocal()}
                        >
                            Marcar todas
                        </Button>


                        <Button
                            size="sm"
                            onClick={() => navigate({ to: '/' })}
                        >
                            Ver tudo
                        </Button>
                    </div>
                </div>


                <DropdownMenuSeparator />


                <div className="max-h-[420px] overflow-auto p-2">
                    {preview.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            Sem notificações por enquanto.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {preview.map((n) => (
                                <NotificationItem key={n.id} n={n} compact />
                            ))}
                        </div>
                    )}
                </div>


                <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                    Dica: quando chegar via WebSocket, aparece aqui na hora.
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}