import api from './axios';
import type { OriginPoint, TransportType } from '../types';

export const referencesApi = {
  getOriginPoints: () =>
    api.get<OriginPoint[]>('/origin-points'),

  getTransportTypes: () =>
    api.get<TransportType[]>('/transport-types'),
};
