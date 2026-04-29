import { useQuery } from '@tanstack/react-query';
import { loadsApi } from '../api/loads.api';
import { referencesApi } from '../api/references.api';
import { usersApi } from '../api/users.api';
import type { UserRole } from '../types';
import type { QueryLoadsParams } from '../types/loads.types';

export function useLoads(params: QueryLoadsParams, role: UserRole | undefined, isAdmin: boolean) {
  const useAll = role !== 'shipper' || isAdmin;
  return useQuery({
    queryKey: ['loads', useAll ? 'all' : 'my', params],
    queryFn: () =>
      useAll
        ? loadsApi.getAll(params).then((r) => r.data)
        : loadsApi.getMy(params).then((r) => r.data),
    enabled: !!role,
  });
}

export function useOriginPoints() {
  return useQuery({
    queryKey: ['origin-points'],
    queryFn: () => referencesApi.getOriginPoints().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransportTypes() {
  return useQuery({
    queryKey: ['transport-types'],
    queryFn: () => referencesApi.getTransportTypes().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShippers(enabled: boolean) {
  return useQuery({
    queryKey: ['users', 'shippers'],
    queryFn: () =>
      usersApi.getUsers({ role: 'shipper', limit: 100 }).then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
  });
}
