import { useAuthStore } from '@/stores/auth.store'
import { io, type Socket } from 'socket.io-client'

export const WS_URL = import.meta.env.VITE_WST_URL || 'http://api.localhost'

let socket: Socket | null = null

export function connectRealtime() {
  // Se já existe conexão ativa, retornar
  if (socket?.connected) return socket

  // Se socket existe mas está desconectado, desconectar e criar novo
  if (socket) {
    socket.disconnect()
    socket = null
  }

  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) {
    console.warn('[WebSocket] Sem token de acesso')
    return null
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    auth: { token: accessToken },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('[WebSocket] Conectado ao servidor')
  })

  socket.on('disconnect', () => {
    console.log('[WebSocket] Desconectado do servidor')
  })

  socket.on('error', (error) => {
    console.error('[WebSocket] Erro:', error)
  })

  return socket
}

export function getRealtimeSocket() {
  return socket
}

export function disconnectRealtime() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
