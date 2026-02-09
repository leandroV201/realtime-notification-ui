import { UserResponse } from "@/types/users";
import apiClient from "./http";

export async function getAllUsers() {
    return apiClient.get<UserResponse[]>('/users')
}