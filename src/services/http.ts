import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://api.localhost',
  withCredentials: true,
  timeout: 30000, 
});


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || '');
    }
  });

  isRefreshing = false;
  failedQueue = [];
};


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest && token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return apiClient(originalRequest);
            }
          })
          .catch(() => {
            window.location.href = '/auth';
            return Promise.reject(error);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
