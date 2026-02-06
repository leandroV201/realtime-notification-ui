import { useAuthStore } from "@/stores/auth.store"

export const API_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

export async function http<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const token = useAuthStore((s) => s.token);
    
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers || {}),
        },
    })


    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `HTTP ${res.status}`)
    }


    if (res.status === 204) return undefined as T


    return res.json() as Promise<T>
}