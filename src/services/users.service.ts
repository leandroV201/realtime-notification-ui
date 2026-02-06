import { UserResponse } from "@/types/users";
import { http } from "./http";

export async function getAllUsers() {
    return http<UserResponse[]>('/users')
}