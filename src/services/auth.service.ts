import { http } from './http'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function getCurrentUser(): Promise<AuthResponse['user']> {
  return http<AuthResponse['user']>('/auth/me')
}