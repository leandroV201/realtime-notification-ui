import { send } from "@/types/send";
import apiClient from "./http";

export async function sendNotification(sendData: send) {
    const response = apiClient.post('/events', { 
        userId: sendData.userId,
        message: sendData.message,
        title: sendData.title,
        type: sendData.type,
        data: sendData.data
    });
    return response;
}