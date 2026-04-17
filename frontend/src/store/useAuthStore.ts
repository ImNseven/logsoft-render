import { create } from 'zustand';
import type { User, RegisterData } from '../types';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData, temporaryToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  isAuthenticated: false,
  isLoading: true,

  login: async (phone, password) => {
    const { data } = await authApi.login(phone, password);
    setTokens(data.access_token, data.refresh_token);
    set({ accessToken: data.access_token, refreshToken: data.refresh_token });
    await get().fetchProfile();
  },

  register: async (registerData, temporaryToken) => {
    const { data } = await authApi.register(registerData, temporaryToken);
    setTokens(data.access_token, data.refresh_token);
    set({ accessToken: data.access_token, refreshToken: data.refresh_token });
    await get().fetchProfile();
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    get().clearAuth();
  },

  refreshTokens: async () => {
    const refresh = get().refreshToken;
    if (!refresh) throw new Error('No refresh token');
    const { data } = await authApi.refresh(refresh);
    setTokens(data.access_token, data.refresh_token);
    set({ accessToken: data.access_token, refreshToken: data.refresh_token });
  },

  fetchProfile: async () => {
    const { data } = await usersApi.getMe();
    set({ user: data, isAuthenticated: true, isLoading: false });
  },

  initialize: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      await get().fetchProfile();
    } catch {
      get().clearAuth();
    }
  },

  clearAuth: () => {
    clearTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
