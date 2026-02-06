import { NotificationBell } from '../notifications/NotificationBell'


export function Topbar() {
    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">Realtime Notifications</div>
                    <div className="text-xs text-muted-foreground">Kafka + Redis + WS</div>
                </div>


                <div className="flex items-center gap-2">
                    <NotificationBell />
                </div>
            </div>
        </header>
    )
}