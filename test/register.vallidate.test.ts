import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'sonner'
import { registerValidate } from '@/utils/validations/register.validate'
import type { RegisterRequest } from '@/types/auth'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

const validData: RegisterRequest = {
  email: 'test@example.com',
  name: 'João Silva',
  password: 'senha123',
  confirmPassword: 'senha123',
}

describe('registerValidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna true para dados válidos', () => {
    expect(registerValidate(validData)).toBe(true)
  })

  it('retorna false e chama toast.error quando senhas não coincidem', () => {
    const data = { ...validData, confirmPassword: 'outraSenha' }
    const result = registerValidate(data)

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith(
      'Ocorreu um erro ao registrar !',
      expect.objectContaining({ description: 'As senhas não coincidem' })
    )
  })

  it('retorna false e chama toast.error quando senha tem menos de 6 caracteres', () => {
    const data = { ...validData, password: '123', confirmPassword: '123' }
    const result = registerValidate(data)

    expect(result).toBe(false)
    expect(toast.error).toHaveBeenCalledWith(
      'Ocorreu um erro ao registrar !',
      expect.objectContaining({ description: 'A senha deve ter pelo menos 6 caracteres' })
    )
  })

  it('retorna false quando senha tem exatamente 5 caracteres', () => {
    const data = { ...validData, password: '12345', confirmPassword: '12345' }
    expect(registerValidate(data)).toBe(false)
  })

  it('retorna true quando senha tem exatamente 6 caracteres e coincidem', () => {
    const data = { ...validData, password: '123456', confirmPassword: '123456' }
    expect(registerValidate(data)).toBe(true)
  })

  it('verifica primeiro se senhas coincidem antes de verificar o tamanho', () => {
    // Senhas curtas mas que não coincidem — deve falhar na checagem de coincidência
    const data = { ...validData, password: '12', confirmPassword: '34' }
    registerValidate(data)

    expect(toast.error).toHaveBeenCalledWith(
      'Ocorreu um erro ao registrar !',
      expect.objectContaining({ description: 'As senhas não coincidem' })
    )
  })

  it('não chama toast.error para dados válidos', () => {
    registerValidate(validData)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('funciona sem confirmPassword (undefined)', () => {
    const data: RegisterRequest = { ...validData, confirmPassword: undefined }
    const result = registerValidate(data)
    // password !== undefined, so they don't match
    expect(result).toBe(false)
  })
})