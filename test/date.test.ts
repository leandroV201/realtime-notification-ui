import { formatRelativeDate } from '@/utils/date'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('formatRelativeDate', () => {
  const now = new Date('2024-06-01T12:00:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retorna "agora" para datas com menos de 10 segundos', () => {
    const iso = new Date(now.getTime() - 5000).toISOString()
    expect(formatRelativeDate(iso)).toBe('agora')
  })

  it('retorna "agora" para a data exata atual', () => {
    expect(formatRelativeDate(now.toISOString())).toBe('agora')
  })

  it('retorna segundos para datas entre 10s e 59s', () => {
    const iso = new Date(now.getTime() - 30000).toISOString()
    expect(formatRelativeDate(iso)).toBe('30s atrás')
  })

  it('retorna "59s atrás" para 59 segundos', () => {
    const iso = new Date(now.getTime() - 59000).toISOString()
    expect(formatRelativeDate(iso)).toBe('59s atrás')
  })

  it('retorna minutos para datas entre 1min e 59min', () => {
    const iso = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeDate(iso)).toBe('5min atrás')
  })

  it('retorna "1min atrás" para exatamente 60 segundos', () => {
    const iso = new Date(now.getTime() - 60000).toISOString()
    expect(formatRelativeDate(iso)).toBe('1min atrás')
  })

  it('retorna "59min atrás" para 59 minutos', () => {
    const iso = new Date(now.getTime() - 59 * 60 * 1000).toISOString()
    expect(formatRelativeDate(iso)).toBe('59min atrás')
  })

  it('retorna horas para datas entre 1h e 23h', () => {
    const iso = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(iso)).toBe('3h atrás')
  })

  it('retorna "1h atrás" para exatamente 1 hora', () => {
    const iso = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(iso)).toBe('1h atrás')
  })

  it('retorna dias para datas entre 1d e 29d', () => {
    const iso = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(iso)).toBe('5d atrás')
  })

  it('retorna "1d atrás" para exatamente 1 dia', () => {
    const iso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeDate(iso)).toBe('1d atrás')
  })

  it('retorna data formatada em pt-BR para datas com 30+ dias', () => {
    const iso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeDate(iso)
    // should be a date string like "02/05/2024"
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('retorna data formatada para datas muito antigas', () => {
    const iso = new Date('2023-01-15T00:00:00Z').toISOString()
    const result = formatRelativeDate(iso)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})