import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationsStore } from '@/stores/notification.store'
import type { Notification } from '@/types/notification'

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: `notif-${Math.random()}`,
  userId: 'user-1',
  title: 'Título',
  message: 'Mensagem',
  level: 'info',
  type: 'system',
  readAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
})

// Reset store before each test
beforeEach(() => {
  useNotificationsStore.setState({
    items: [],
    loading: false,
    loadedOnce: false,
  })
})

describe('NotificationsStore - estado inicial', () => {
  it('tem items vazio por padrão', () => {
    expect(useNotificationsStore.getState().items).toEqual([])
  })

  it('tem loading false por padrão', () => {
    expect(useNotificationsStore.getState().loading).toBe(false)
  })

  it('tem loadedOnce false por padrão', () => {
    expect(useNotificationsStore.getState().loadedOnce).toBe(false)
  })

  it('unreadCount retorna 0 quando vazio', () => {
    expect(useNotificationsStore.getState().unreadCount()).toBe(0)
  })
})

describe('NotificationsStore - setLoading', () => {
  it('define loading como true', () => {
    useNotificationsStore.getState().setLoading(true)
    expect(useNotificationsStore.getState().loading).toBe(true)
  })

  it('define loading como false', () => {
    useNotificationsStore.getState().setLoading(true)
    useNotificationsStore.getState().setLoading(false)
    expect(useNotificationsStore.getState().loading).toBe(false)
  })
})

describe('NotificationsStore - setAll', () => {
  it('define os items e marca loadedOnce como true', () => {
    const items = [makeNotification({ id: '1' }), makeNotification({ id: '2' })]
    useNotificationsStore.getState().setAll(items)

    const state = useNotificationsStore.getState()
    expect(state.items).toHaveLength(2)
    expect(state.loadedOnce).toBe(true)
  })

  it('ordena os items por createdAt descrescente', () => {
    const older = makeNotification({ id: 'old', createdAt: '2024-01-01T00:00:00Z' })
    const newer = makeNotification({ id: 'new', createdAt: '2024-06-01T00:00:00Z' })

    useNotificationsStore.getState().setAll([older, newer])
    const { items } = useNotificationsStore.getState()

    expect(items[0].id).toBe('new')
    expect(items[1].id).toBe('old')
  })

  it('substitui os items existentes', () => {
    useNotificationsStore.getState().setAll([makeNotification({ id: 'a' })])
    useNotificationsStore.getState().setAll([makeNotification({ id: 'b' })])

    expect(useNotificationsStore.getState().items).toHaveLength(1)
    expect(useNotificationsStore.getState().items[0].id).toBe('b')
  })
})

describe('NotificationsStore - upsert', () => {
  it('adiciona notificação nova quando id não existe', () => {
    const n = makeNotification({ id: 'new-1' })
    useNotificationsStore.getState().upsert(n)

    expect(useNotificationsStore.getState().items).toHaveLength(1)
    expect(useNotificationsStore.getState().items[0].id).toBe('new-1')
  })

  it('atualiza notificação existente com o mesmo id', () => {
    const original = makeNotification({ id: 'same', title: 'Original' })
    useNotificationsStore.getState().upsert(original)

    const updated = { ...original, title: 'Atualizado' }
    useNotificationsStore.getState().upsert(updated)

    const { items } = useNotificationsStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Atualizado')
  })

  it('insere nova notificação no início (mais recente)', () => {
    const older = makeNotification({ id: 'old', createdAt: '2024-01-01T00:00:00Z' })
    useNotificationsStore.getState().setAll([older])

    const newer = makeNotification({ id: 'new', createdAt: '2024-06-01T00:00:00Z' })
    useNotificationsStore.getState().upsert(newer)

    const { items } = useNotificationsStore.getState()
    expect(items[0].id).toBe('new')
  })
})

describe('NotificationsStore - markRead', () => {
  it('marca uma notificação como lida', () => {
    const n = makeNotification({ id: 'n1', readAt: null })
    useNotificationsStore.getState().setAll([n])

    useNotificationsStore.getState().markRead('n1')

    const updated = useNotificationsStore.getState().items.find((x) => x.id === 'n1')
    expect(updated?.readAt).toBeTruthy()
  })

  it('usa o readAt fornecido quando passado explicitamente', () => {
    const n = makeNotification({ id: 'n2', readAt: null })
    useNotificationsStore.getState().setAll([n])

    const customDate = '2024-06-01T10:00:00Z'
    useNotificationsStore.getState().markRead('n2', customDate)

    const updated = useNotificationsStore.getState().items.find((x) => x.id === 'n2')
    expect(updated?.readAt).toBe(customDate)
  })

  it('não altera nada quando o id não existe', () => {
    const n = makeNotification({ id: 'exists', readAt: null })
    useNotificationsStore.getState().setAll([n])

    useNotificationsStore.getState().markRead('nao-existe')

    expect(useNotificationsStore.getState().items[0].readAt).toBeNull()
  })
})

describe('NotificationsStore - markAllRead', () => {
  it('marca todas as notificações não lidas como lidas', () => {
    const items = [
      makeNotification({ id: '1', readAt: null }),
      makeNotification({ id: '2', readAt: null }),
      makeNotification({ id: '3', readAt: null }),
    ]
    useNotificationsStore.getState().setAll(items)

    useNotificationsStore.getState().markAllRead()

    const { items: updated } = useNotificationsStore.getState()
    updated.forEach((n) => expect(n.readAt).toBeTruthy())
  })

  it('não altera readAt de notificações já lidas', () => {
    const readDate = '2024-01-01T00:00:00Z'
    const items = [
      makeNotification({ id: '1', readAt: readDate }),
      makeNotification({ id: '2', readAt: null }),
    ]
    useNotificationsStore.getState().setAll(items)

    useNotificationsStore.getState().markAllRead()

    const item1 = useNotificationsStore.getState().items.find((n) => n.id === '1')
    expect(item1?.readAt).toBe(readDate) // preservado
  })

  it('unreadCount retorna 0 após markAllRead', () => {
    const items = [
      makeNotification({ id: '1', readAt: null }),
      makeNotification({ id: '2', readAt: null }),
    ]
    useNotificationsStore.getState().setAll(items)

    useNotificationsStore.getState().markAllRead()

    expect(useNotificationsStore.getState().unreadCount()).toBe(0)
  })
})

describe('NotificationsStore - unreadCount', () => {
  it('conta apenas notificações não lidas', () => {
    const items = [
      makeNotification({ id: '1', readAt: null }),
      makeNotification({ id: '2', readAt: '2024-01-01T00:00:00Z' }),
      makeNotification({ id: '3', readAt: null }),
    ]
    useNotificationsStore.getState().setAll(items)

    expect(useNotificationsStore.getState().unreadCount()).toBe(2)
  })

  it('retorna 0 quando todas estão lidas', () => {
    const items = [
      makeNotification({ id: '1', readAt: '2024-01-01T00:00:00Z' }),
      makeNotification({ id: '2', readAt: '2024-01-02T00:00:00Z' }),
    ]
    useNotificationsStore.getState().setAll(items)

    expect(useNotificationsStore.getState().unreadCount()).toBe(0)
  })

  it('retorna o total quando todas estão não lidas', () => {
    const items = [
      makeNotification({ id: '1', readAt: null }),
      makeNotification({ id: '2', readAt: null }),
      makeNotification({ id: '3', readAt: null }),
    ]
    useNotificationsStore.getState().setAll(items)

    expect(useNotificationsStore.getState().unreadCount()).toBe(3)
  })
})