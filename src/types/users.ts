export interface UserResponse {
  id: string
  email: string
  name: string | null
  createdAt: string
  confirmPassword?: string
}