import api from './axios';
import type { PaginatedResponse } from '../types';
import type { CreateDealDto, Deal, QueryDealsParams } from '../types/deals.types';

export const dealsApi = {
  create: (data: CreateDealDto) => api.post<Deal>('/deals', data),
  getAll: (params: QueryDealsParams) =>
    api.get<PaginatedResponse<Deal>>('/deals', { params }),
  getMy: (params: QueryDealsParams) =>
    api.get<PaginatedResponse<Deal>>('/deals/my', { params }),
  getById: (id: string) => api.get<Deal>(`/deals/${id}`),
  cancel: (id: string) => api.patch<Deal>(`/deals/${id}/cancel`, {}),
  confirmPayment: (id: string) => api.patch<Deal>(`/deals/${id}/confirm-payment`),
  reveal: (id: string) => api.patch<Deal>(`/deals/${id}/reveal`),
  replaceVehicle: (id: string, data: { newVehicleId: string }) =>
    api.patch<Deal>(`/deals/${id}/replace-vehicle`, data),
};
