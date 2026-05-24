import api from './axios';
import type { PaginatedResponse } from '../types';
import type {
  CreateVehicleDto,
  QueryVehiclesParams,
  Vehicle,
  VehicleDocument,
} from '../types/vehicles.types';

export const vehiclesApi = {
  create: (data: CreateVehicleDto) => api.post<Vehicle>('/vehicles', data),

  getAll: (params: QueryVehiclesParams) =>
    api.get<PaginatedResponse<Vehicle>>('/vehicles', { params }),

  getMy: (params: QueryVehiclesParams) =>
    api.get<PaginatedResponse<Vehicle>>('/vehicles/my', { params }),

  getById: (id: string) => api.get<Vehicle>(`/vehicles/${id}`),

  update: (id: string, data: Partial<CreateVehicleDto>) =>
    api.patch<Vehicle>(`/vehicles/${id}`, data),

  deactivate: (id: string) => api.patch<Vehicle>(`/vehicles/${id}/deactivate`),

  activate: (id: string) => api.patch<Vehicle>(`/vehicles/${id}/activate`),

  uploadDocument: (vehicleId: string, file: File, docType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    return api.post<VehicleDocument>(
      `/vehicles/${vehicleId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  getDocuments: (vehicleId: string) =>
    api.get<VehicleDocument[]>(`/vehicles/${vehicleId}/documents`),

  downloadDocument: (docId: string) =>
    api.get<{ url: string }>(`/documents/${docId}/download`),

  deleteDocument: (docId: string) => api.delete(`/documents/${docId}`),
};
