import { useQuery } from '@tanstack/react-query';
import { dealsApi } from '../api/deals.api';
import type { QueryDealsParams } from '../types/deals.types';
import type { UserRole } from '../types';

export function useDeals(params: QueryDealsParams, role: UserRole | undefined, isAdmin: boolean) {
  const useAll = role === 'dispatcher' || isAdmin;
  return useQuery({
    queryKey: ['deals', useAll ? 'all' : 'my', params],
    queryFn: () =>
      useAll
        ? dealsApi.getAll(params).then((r) => r.data)
        : dealsApi.getMy(params).then((r) => r.data),
    enabled: !!role,
  });
}
