import api from './axios';
import type { User, UpdateProfileDto, UpdateUserDto, QueryUsersParams, PaginatedResponse } from '../types';

export const usersApi = {
  getMe: () =>
    api.get<User>('/users/me'),

  updateMe: (data: UpdateProfileDto) =>
    api.patch<User>('/users/me', data),

  getUsers: (params: QueryUsersParams) =>
    api.get<PaginatedResponse<User>>('/users', { params }),

  getUserById: (id: string) =>
    api.get<User>(`/users/${id}`),

  updateUser: (id: string, data: UpdateUserDto) =>
    api.patch<User>(`/users/${id}`, data),
};
