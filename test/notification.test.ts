import { describe, it, expect } from 'vitest'
import {
  sortNotificationsDesc,
  isUnread,
  levelToLabel,
} from '@/utils/notification'
import type { Notification } from '@/types/notification'

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notif-1',
  userId: 'user-1',
  title: 'Título',
  message: 'Mensagem',
  level: 'info',
  type: 'system',
  readAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('sortNotificationsDesc', () => {
  it('ordena notificações mais recentes primeiro', () => {
    const older = makeNotification({ id: '1', createdAt: '2024-01-01T10:00:00Z' })
    const newer = makeNotification({ id: '2', createdAt: '2024-01-02T10:00:00Z' })

    const sorted = [older, newer].sort(sortNotificationsDesc)
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('1')
  })

  it('mantém a ordem original para datas iguais', () => {
    const date = '2024-01-01T10:00:00Z'
    const a = makeNotification({ id: 'a', createdAt: date })
    const b = makeNotification({ id: 'b', createdAt: date })

    const result = sortNotificationsDesc(a, b)
    expect(result).toBe(0)
  })

  it('retorna positivo quando b é mais recente que a', () => {
    const a = makeNotification({ createdAt: '2024-01-02T00:00:00Z' })
    const b = makeNotification({ createdAt: '2024-01-03T00:00:00Z' })
    expect(sortNotificationsDesc(a, b)).toBeGreaterThan(0)
  })

  it('retorna negativo quando a é mais recente que b', () => {
    const a = makeNotification({ createdAt: '2024-01-03T00:00:00Z' })
    const b = makeNotification({ createdAt: '2024-01-01T00:00:00Z' })
    expect(sortNotificationsDesc(a, b)).toBeLessThan(0)
  })

  it('ordena um array de 3 notificações corretamente', () => {
    const items = [
      makeNotification({ id: 'c', createdAt: '2024-01-01T00:00:00Z' }),
      makeNotification({ id: 'a', createdAt: '2024-01-03T00:00:00Z' }),
      makeNotification({ id: 'b', createdAt: '2024-01-02T00:00:00Z' }),
    ]
    const sorted = [...items].sort(sortNotificationsDesc)
    expect(sorted.map((n) => n.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('isUnread', () => {
  it('retorna true quando readAt é null', () => {
    expect(isUnread(makeNotification({ readAt: null }))).toBe(true)
  })

  it('retorna true quando readAt é undefined', () => {
    const n = makeNotification()
    delete n.readAt
    expect(isUnread(n)).toBe(true)
  })

  it('retorna false quando readAt tem uma data', () => {
    expect(isUnread(makeNotification({ readAt: '2024-01-01T00:00:00Z' }))).toBe(false)
  })

  it('retorna false para readAt sendo uma string não vazia', () => {
    expect(isUnread(makeNotification({ readAt: '2024-06-01T12:00:00Z' }))).toBe(false)
  })
})

describe('levelToLabel', () => {
  it('retorna "Sucesso" para success', () => {
    expect(levelToLabel('success')).toBe('Sucesso')
  })

  it('retorna "Atenção" para warning', () => {
    expect(levelToLabel('warning')).toBe('Atenção')
  })

  it('retorna "Erro" para error', () => {
    expect(levelToLabel('error')).toBe('Erro')
  })

  it('retorna "Info" para info', () => {
    expect(levelToLabel('info')).toBe('Info')
  })

  it('retorna "Info" para qualquer valor não mapeado', () => {
    expect(levelToLabel('unknown' as any)).toBe('Info')
  })
})