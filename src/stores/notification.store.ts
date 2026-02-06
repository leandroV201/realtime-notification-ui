import { create } from 'zustand'
import type { Notification } from '../types/notification'
import { isUnread, sortNotificationsDesc } from '../utils/notification'

type NotificationsState = {
    items: Notification[]
    loading: boolean
    loadedOnce: boolean

    setLoading: (v: boolean) => void
    setAll: (items: Notification[]) => void
    upsert: (n: Notification) => void
    markRead: (id: string, readAt?: string) => void
    markAllRead: () => void

    unreadCount: () => number
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
    items: [],
    loading: false,
    loadedOnce: false,

    setLoading: (v) => set({ loading: v }),

    setAll: (items) =>
        set({
            items: [...items].sort(sortNotificationsDesc),
            loadedOnce: true,
        }),

    upsert: (n) => {
        const items = get().items
        const idx = items.findIndex((x) => x.id === n.id)

        if (idx === -1) {
            set({ items: [n, ...items].sort(sortNotificationsDesc) })
            return
        }

        const next = [...items]
        next[idx] = n
        set({ items: next.sort(sortNotificationsDesc) })
    },

    markRead: (id, readAt) => {
        const items = get().items
        const idx = items.findIndex((x) => x.id === id)
        if (idx === -1) return

        const next = [...items]
        next[idx] = {
            ...next[idx],
            readAt: readAt ?? new Date().toISOString(),
        }

        set({ items: next })
    },

    markAllRead: () => {
        const now = new Date().toISOString()
        set({
            items: get().items.map((n) => ({
                ...n,
                readAt: n.readAt ?? now,
            })),
        })
    },

    unreadCount: () => get().items.filter(isUnread).length,
}))