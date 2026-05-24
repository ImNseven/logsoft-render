import type { User } from './index';
import type { Load } from './loads.types';
import type { Vehicle } from './vehicles.types';

export type DealStatus = 'pending' | 'paid' | 'documents_revealed' | 'cancelled';
export type PaymentStatus = 'pending' | 'qr_sent' | 'confirmed';

export interface Payment {
  id: string;
  dealId: string;
  payerId: string;
  amount: number | string | null;
  qrCodeUrl: string | null;
  qrUrl: string | null;
  qrFileName: string | null;
  qrMimeType: string | null;
  status: PaymentStatus;
  confirmedBy: string | null;
  confirmedAt: string | null;
  createdAt: string;
  payer?: User;
}

export interface Deal {
  id: string;
  loadId: string;
  vehicleId: string;
  shipperId: string;
  carrierId: string;
  dispatcherId: string;
  status: DealStatus;
  vehicleReplaced: boolean;
  documentsRevealedAt: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  load?: Load;
  vehicle?: Vehicle;
  shipper?: User & { phone: string | null };
  carrier?: User & { phone: string | null };
  dispatcher?: User & { phone: string | null };
  payment?: Payment;
}

export interface CreateDealDto {
  loadId: string;
  vehicleId: string;
  notes?: string;
}

export interface QueryDealsParams {
  status?: DealStatus;
  shipperId?: string;
  carrierId?: string;
  dispatcherId?: string;
  loadId?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}
