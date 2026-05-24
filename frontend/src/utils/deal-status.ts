import type { DealStatus, PaymentStatus } from '../types/deals.types';

export function dealStatusLabel(s: DealStatus): string {
  switch (s) {
    case 'pending': return 'Ожидание оплаты';
    case 'paid': return 'Оплачено';
    case 'documents_revealed': return 'Документы раскрыты';
    case 'cancelled': return 'Отменено';
  }
}

export function dealStatusColor(s: DealStatus): 'orange' | 'blue' | 'green' | 'red' {
  switch (s) {
    case 'pending': return 'orange';
    case 'paid': return 'blue';
    case 'documents_revealed': return 'green';
    case 'cancelled': return 'red';
  }
}

export function paymentStatusLabel(s: PaymentStatus): string {
  switch (s) {
    case 'pending': return 'Ожидание QR';
    case 'qr_sent': return 'QR отправлен';
    case 'confirmed': return 'Оплачено';
  }
}
