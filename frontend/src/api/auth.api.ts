import api from './axios';
import type { RegisterData } from '../types';

export const authApi = {
  sendCode: (phone: string) =>
    api.post<{ message: string; phone: string; code?: string }>(
      '/auth/send-code',
      { phone },
    ),

  verifyCode: (phone: string, code: string) =>
    api.post<{ temporary_token: string }>('/auth/verify-code', { phone, code }),

  register: (data: RegisterData, temporaryToken: string) =>
    api.post('/auth/register', data, {
      headers: { Authorization: `Bearer ${temporaryToken}` },
    }),

  login: (phone: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string }>('/auth/login', { phone, password }),

  refresh: (refreshToken: string) =>
    api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', { refresh_token: refreshToken }),

  logout: () =>
    api.post('/auth/logout'),
};
