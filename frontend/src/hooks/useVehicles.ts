import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../api/vehicles.api';
import { usersApi } from '../api/users.api';
import type { UserRole } from '../types';
import type { QueryVehiclesParams } from '../types/vehicles.types';

export function useVehicles(
  params: QueryVehiclesParams,
  role: UserRole | undefined,
  isAdmin: boolean,
) {
  const useAll = role !== 'carrier' || isAdmin;
  return useQuery({
    queryKey: ['vehicles', useAll ? 'all' : 'my', params],
    queryFn: () =>
      useAll
        ? vehiclesApi.getAll(params).then((r) => r.data)
        : vehiclesApi.getMy(params).then((r) => r.data),
    enabled: !!role,
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });
}

export function useVehicleDocuments(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ['vehicle-documents', vehicleId],
    queryFn: () =>
      vehiclesApi.getDocuments(vehicleId!).then((r) => r.data),
    enabled: !!vehicleId,
  });
}

export function useCarriers(enabled: boolean) {
  return useQuery({
    queryKey: ['users', 'carriers'],
    queryFn: () =>
      usersApi.getUsers({ role: 'carrier', limit: 100 }).then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
  });
}
