import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import apiClient from '../services/http';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isInitialized: boolean;

  setAuth: (user: User, accessToken: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  socket: null,
  isInitialized: false,

  setAuth: (user, accessToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
    localStorage.setItem('user', JSON.stringify(user));
    get().connectWebSocket();
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post(
        '/auth/login',
        { email, password },
        { withCredentials: true },
      );

      const { accessToken, user } = response.data;

      set({
        accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      get().connectWebSocket();

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erro ao fazer login';

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post(
        '/auth/register',
        { name, email, password },
        { withCredentials: true },
      );

      const { accessToken, user } = response.data;

      set({
        accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      get().connectWebSocket();

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erro ao registrar';

      set({
        error: errorMessage,
        isLoading: false,
      });

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    get().disconnectWebSocket();

    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
    } finally {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        error: null,
        socket: null,
      });
      localStorage.removeItem('user');
    }
  },

  refreshAccessToken: async () => {
    try {
      const response = await apiClient.post(
        '/auth/refresh',
        {},
        { withCredentials: true },
      );

      const { accessToken } = response.data;

      set({ accessToken });

      get().disconnectWebSocket();
      get().connectWebSocket();

      return accessToken;
    } catch (error) {
      get().logout();
      return null;
    }
  },

  connectWebSocket: () => {
    const token = get().accessToken;

    if (!token) {
      return;
    }

    const existingSocket = get().socket;
    if (existingSocket?.connected) {
      existingSocket.disconnect();
    }

    const socket = io(import.meta.env.VITE_API_URL || 'http://10.86.254.128:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('error', (error) => {

      if (error.message?.includes('Token') || error.message?.includes('inválido')) {
        get().refreshAccessToken();
      }
    });


    set({ socket });
  },

  disconnectWebSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  clearError: () => set({ error: null }),

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        set({
          user: JSON.parse(storedUser),
          isAuthenticated: false, 
        });

        
        try {
          const newToken = await get().refreshAccessToken();
          if (newToken) {
            set({
              accessToken: newToken,
              isAuthenticated: true,
            });
            set({ isInitialized: true, isLoading: false });
            return;
          }
        } catch (refreshError) {
          localStorage.removeItem('user');
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
          return;
        }
      }

      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      set({ isInitialized: true, isLoading: false });
    }
  },
}));