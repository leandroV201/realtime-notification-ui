// upload.service.ts

import apiClient from "./http";

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload/image', formData);

  return response.data;
}