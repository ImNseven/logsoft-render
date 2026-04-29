import api from './axios';
import type { PaginatedResponse } from '../types';
import type {
  CreateLoadDto,
  Load,
  QueryLoadsParams,
} from '../types/loads.types';

export const loadsApi = {
  create: (data: CreateLoadDto) => api.post<Load>('/loads', data),
  getAll: (params: QueryLoadsParams) =>
    api.get<PaginatedResponse<Load>>('/loads', { params }),
  getMy: (params: QueryLoadsParams) =>
    api.get<PaginatedResponse<Load>>('/loads/my', { params }),
  getById: (id: string) => api.get<Load>(`/loads/${id}`),
  update: (id: string, data: Partial<CreateLoadDto>) =>
    api.patch<Load>(`/loads/${id}`, data),
  cancel: (id: string) => api.patch<Load>(`/loads/${id}/cancel`),
};
