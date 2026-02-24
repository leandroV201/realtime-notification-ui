import { describe, it, expect } from 'vitest'
import { cn } from '@/utils/cn'

describe('cn', () => {
  it('junta classes simples com espaço', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filtra valores falsy: undefined', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('filtra valores falsy: null', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('filtra valores falsy: false', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar')
  })

  it('retorna string vazia quando todos os valores são falsy', () => {
    expect(cn(undefined, null, false)).toBe('')
  })

  it('retorna a única classe quando apenas uma é passada', () => {
    expect(cn('only')).toBe('only')
  })

  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('')
  })

  it('lida com múltiplos falsy misturados com classes válidas', () => {
    expect(cn('a', false, undefined, null, 'b', 'c')).toBe('a b c')
  })

  it('preserva espaços dentro das classes', () => {
    expect(cn('text-sm font-bold', 'mt-2')).toBe('text-sm font-bold mt-2')
  })

  it('funciona com strings condicionais (padrão ternário)', () => {
    const active = true
    const result = cn('base', active ? 'active' : undefined)
    expect(result).toBe('base active')
  })

  it('funciona com strings condicionais falsas', () => {
    const active = false
    const result = cn('base', active ? 'active' : undefined)
    expect(result).toBe('base')
  })
})