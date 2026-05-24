import api from './axios';
import type { Payment } from '../types/deals.types';

export const paymentsApi = {
  getByDeal: (dealId: string) => api.get<Payment>(`/deals/${dealId}/payment`),
  sendQr: (paymentId: string, file: File, amount?: number) => {
    const fd = new FormData();
    fd.append('file', file);
    if (amount !== undefined) fd.append('amount', String(amount));
    return api.patch<Payment>(`/payments/${paymentId}/send-qr`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
