import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'

// Mock apiClient
vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connected: false,
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    off: vi.fn(),
  })),
}))

import apiClient from '@/services/http'
import { io } from 'socket.io-client'

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'João',
  createdAt: '2024-01-01T00:00:00Z',
}

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: global,
    writable: true,
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    socket: null,
  })
  const storage: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => { storage[key] = value },
    removeItem: (key: string) => { delete storage[key] },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]) },
  })
})

describe('AuthStore - estado inicial', () => {
  it('user é null por padrão', () => {
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('accessToken é null por padrão', () => {
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('isAuthenticated é false por padrão', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('isLoading é false por padrão', () => {
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('error é null por padrão', () => {
    expect(useAuthStore.getState().error).toBeNull()
  })
})

describe('AuthStore - setAuth', () => {
  it('define usuário, token e isAuthenticated', () => {
    useAuthStore.getState().setAuth(mockUser, 'token-abc')

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('token-abc')
    expect(state.isAuthenticated).toBe(true)
  })

  it('chama connectWebSocket após setAuth', () => {
    const connectSpy = vi.spyOn(useAuthStore.getState(), 'connectWebSocket')
    useAuthStore.getState().setAuth(mockUser, 'token-abc')
    expect(connectSpy).toHaveBeenCalled()
  })
})

describe('AuthStore - clearError', () => {
  it('limpa o erro', () => {
    useAuthStore.setState({ error: 'Algum erro' })
    useAuthStore.getState().clearError()
    expect(useAuthStore.getState().error).toBeNull()
  })
})

describe('AuthStore - login', () => {
  it('retorna success: true e define estado ao fazer login com sucesso', async () => {
    ;(apiClient.post as any).mockResolvedValueOnce({
      data: { accessToken: 'jwt-token', user: mockUser },
    })

    const result = await useAuthStore.getState().login('test@example.com', '123456')

    expect(result.success).toBe(true)
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('jwt-token')
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('define isLoading como true durante o login', async () => {
    let loadingDuringCall = false
    ;(apiClient.post as any).mockImplementationOnce(async () => {
      loadingDuringCall = useAuthStore.getState().isLoading
      return { data: { accessToken: 'jwt', user: mockUser } }
    })

    await useAuthStore.getState().login('test@example.com', '123456')
    expect(loadingDuringCall).toBe(true)
  })

  it('retorna success: false e define error quando login falha', async () => {
    ;(apiClient.post as any).mockRejectedValueOnce({
      response: { data: { message: 'Credenciais inválidas' } },
    })

    const result = await useAuthStore.getState().login('wrong@example.com', 'wrong')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Credenciais inválidas')
    expect(useAuthStore.getState().error).toBe('Credenciais inválidas')
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('usa mensagem de fallback quando error não tem response.data.message', async () => {
    ;(apiClient.post as any).mockRejectedValueOnce(new Error('Network Error'))

    const result = await useAuthStore.getState().login('a@b.com', '123')
    expect(result.error).toBe('Erro ao fazer login')
  })
})

describe('AuthStore - register', () => {
  it('retorna success: true ao registrar com sucesso', async () => {
    ;(apiClient.post as any).mockResolvedValueOnce({
      data: { accessToken: 'jwt-register', user: mockUser },
    })

    const result = await useAuthStore.getState().register('João', 'joao@example.com', 'senha123')

    expect(result.success).toBe(true)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().accessToken).toBe('jwt-register')
  })

  it('retorna success: false ao registrar com erro', async () => {
    ;(apiClient.post as any).mockRejectedValueOnce({
      response: { data: { message: 'E-mail já cadastrado' } },
    })

    const result = await useAuthStore.getState().register('Joao', 'existente@example.com', 'senha')

    expect(result.success).toBe(false)
    expect(result.error).toBe('E-mail já cadastrado')
  })

  it('usa mensagem fallback de registro quando não há response', async () => {
    ;(apiClient.post as any).mockRejectedValueOnce(new Error('Network Error'))

    const result = await useAuthStore.getState().register('a', 'a@b.com', '123')
    expect(result.error).toBe('Erro ao registrar')
  })
})

describe('AuthStore - logout', () => {
  it('limpa o estado após logout', async () => {
    useAuthStore.setState({
      user: mockUser,
      accessToken: 'token',
      isAuthenticated: true,
    })
    ;(apiClient.post as any).mockResolvedValueOnce({})

    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('ainda limpa o estado mesmo quando chamada de logout falha', async () => {
    useAuthStore.setState({
      user: mockUser,
      accessToken: 'token',
      isAuthenticated: true,
    })
    ;(apiClient.post as any).mockRejectedValueOnce(new Error('Network'))

    await useAuthStore.getState().logout()

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('AuthStore - connectWebSocket', () => {
  it('não conecta quando não há accessToken', () => {
    useAuthStore.getState().connectWebSocket()
    expect(io).not.toHaveBeenCalled()
  })

  it('conecta quando há accessToken', () => {
    useAuthStore.setState({ accessToken: 'valid-token' })
    useAuthStore.getState().connectWebSocket()
    expect(io).toHaveBeenCalled()
  })

  it('define socket no estado após conectar', () => {
    useAuthStore.setState({ accessToken: 'valid-token' })
    useAuthStore.getState().connectWebSocket()
    expect(useAuthStore.getState().socket).not.toBeNull()
  })
})

describe('AuthStore - disconnectWebSocket', () => {
  it('desconecta e limpa socket do estado', () => {
    const mockSocket = { disconnect: vi.fn(), connected: true, on: vi.fn() }
    useAuthStore.setState({ socket: mockSocket as any })

    useAuthStore.getState().disconnectWebSocket()

    expect(mockSocket.disconnect).toHaveBeenCalled()
    expect(useAuthStore.getState().socket).toBeNull()
  })

  it('não faz nada quando socket é null', () => {
    useAuthStore.setState({ socket: null })
    expect(() => useAuthStore.getState().disconnectWebSocket()).not.toThrow()
  })
})