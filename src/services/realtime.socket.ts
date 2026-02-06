import { io, type Socket } from 'socket.io-client'


export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'


let socket: Socket | null = null


export function connectRealtime(userId: string) {
    if (socket) return socket


    socket = io(WS_URL, {
        transports: ['websocket'],
    })


    socket.on('connect', () => {
        socket?.emit('join', { userId })
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