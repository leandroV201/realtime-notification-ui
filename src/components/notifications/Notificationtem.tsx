import { useMemo } from 'react'
import { Check, CircleAlert, Info, ShieldAlert, Sparkles } from 'lucide-react'
import type { Notification } from '../../types/notification'
import { cn } from '../../utils/cn'
import { formatRelativeDate } from '../../utils/date'
import { isUnread } from '../../utils/notification'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNotificationsStore } from '@/stores/notification.store'

function iconByType(type: Notification['type']) {
  console.log(type);
  switch (type) {
    case 'security':
      return ShieldAlert
    case 'billing':
      return CircleAlert
    case 'mention':
      return Sparkles
    default:
      return Info
  }
}

export function NotificationItem({
  n,
  compact,
}: {
  n: Notification
  compact?: boolean
}) {
  const markReadLocal = useNotificationsStore((s) => s.markRead)

  const unread = isUnread(n)
  const Icon = useMemo(() => iconByType(n.type), [n.type])

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border bg-background p-3 shadow-sm',
        'rounded-2xl',
        unread ? 'border-foreground/20' : 'opacity-90',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 grid h-9 w-9 place-items-center rounded-2xl border',
            unread ? 'bg-foreground text-background' : 'bg-muted',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{n.title}</div>
              <div
                className={cn(
                  'mt-0.5 text-sm text-muted-foreground',
                  compact ? 'line-clamp-2' : 'line-clamp-3',
                )}
              >
                {n.message}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-muted-foreground">
                {formatRelativeDate(n.createdAt)}
              </div>

              {unread && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 transition group-hover:opacity-100"
                  onClick={() => markReadLocal(n.id)}
                  title="Marcar como lida"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {unread && (
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground" />
              <span className="text-xs text-muted-foreground">Não lida</span>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-foreground/30 to-transparent opacity-0 transition group-hover:opacity-100" />
    </Card>
  )
}