import api from './axios';
import type { AdminStats } from '../types/admin.types';
import type { OriginPoint, TransportType } from '../types';

export interface DictionaryCreateDto {
  name: string;
}

export interface DictionaryUpdateDto {
  name?: string;
  is_active?: boolean;
}

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),

  getAllOriginPoints: () => api.get<OriginPoint[]>('/origin-points/all'),
  createOriginPoint: (data: DictionaryCreateDto) =>
    api.post<OriginPoint>('/origin-points', data),
  updateOriginPoint: (id: number, data: DictionaryUpdateDto) =>
    api.patch<OriginPoint>(`/origin-points/${id}`, data),
  removeOriginPoint: (id: number) =>
    api.delete<OriginPoint>(`/origin-points/${id}`),

  getAllTransportTypes: () => api.get<TransportType[]>('/transport-types/all'),
  createTransportType: (data: DictionaryCreateDto) =>
    api.post<TransportType>('/transport-types', data),
  updateTransportType: (id: number, data: DictionaryUpdateDto) =>
    api.patch<TransportType>(`/transport-types/${id}`, data),
  removeTransportType: (id: number) =>
    api.delete<TransportType>(`/transport-types/${id}`),
};
