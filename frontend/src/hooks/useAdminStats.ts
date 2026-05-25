import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
  });
}
