export const API_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) return null
    const parsed = JSON.parse(authStorage)
    return parsed?.state?.token || null
  } catch {
    return null
  }
}

export async function http<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const token = getAuthToken()
    
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