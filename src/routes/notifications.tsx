import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useNotificationsStore } from '@/stores/notification.store'
import { useAuthStore } from '@/stores/auth.store'
import { listNotifications, markAllRead } from '@/services/notification.service'
import { LogOut, User as UserIcon } from 'lucide-react'
import { NotificationFilters } from '@/components/notifications/NotificationFilters'
import { NotificationList } from '@/components/notifications/NotificationList'
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton'
import { connectRealtime, disconnectRealtime } from '@/services/realtime.socket'
import { isUnread } from '@/utils/notification'

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
  beforeLoad: ({ context }) => {
    // Redireciona para login se não autenticado
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) {
      throw new Error('Not authenticated')
    }
    try {
      const parsed = JSON.parse(authStorage)
      if (!parsed?.state?.isAuthenticated) {
        throw new Error('Not authenticated')
      }
    } catch {
      throw new Error('Not authenticated')
    }
  },
  onError: () => {
    // Redireciona para auth em caso de erro
    window.location.href = '/auth'
  },
})

export function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const items = useNotificationsStore((s) => s.items)
  const loading = useNotificationsStore((s) => s.loading)
  const setLoading = useNotificationsStore((s) => s.setLoading)
  const setAll = useNotificationsStore((s) => s.setAll)
  const upsert = useNotificationsStore((s) => s.upsert)
  const markAllReadLocal = useNotificationsStore((s) => s.markAllRead)

  // Redireciona se não estiver autenticado
  useEffect(() => {
    if (!user) {
      navigate({ to: '/auth' })
    }
  }, [user, navigate])

  // 1) Carrega histórico
  useEffect(() => {
    if (!user?.id) return

    let mounted = true

    async function run() {
      try {
        setLoading(true)
        const res = await listNotifications(user!.id)
        if (!mounted) return
        setAll(res.items)
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
        // Se erro de autenticação, fazer logout
        if (error instanceof Error && error.message.includes('401')) {
          logout()
          navigate({ to: '/auth' })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [user?.id, setAll, setLoading, logout, navigate])

  // 2) Conecta realtime
  useEffect(() => {
    if (!user?.id) return

    const socket = connectRealtime(user.id)

    socket.on('notification', (payload: Notification) => {
      upsert(payload)
    })

    return () => {
      socket.off('notification')
      disconnectRealtime()
    }
  }, [user?.id, upsert])

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter(isUnread)
    return items
  }, [filter, items])

  async function handleMarkAllRead() {
    if (!user?.id) return

    // Otimista
    markAllReadLocal()

    try {
      await markAllRead(user.id)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  function handleLogout() {
    disconnectRealtime()
    logout()
    navigate({ to: '/auth' })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <UserIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{user.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notificações</h1>
            <p className="text-sm text-muted-foreground">
              Atualizações em tempo real via WebSocket
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NotificationFilters active={filter} onChange={setFilter} />

            <Button variant="secondary" onClick={handleMarkAllRead}>
              Marcar todas como lidas
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <NotificationSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border bg-background p-10 text-center">
              <div className="text-sm font-semibold">Nenhuma notificação</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {filter === 'unread'
                  ? 'Você não tem notificações não lidas'
                  : 'Você ainda não recebeu notificações'}
              </div>
            </div>
          ) : (
            <NotificationList items={filtered} />
          )}
        </div>
      </div>
    </div>
  )
}