import type { Deal } from '../types/deals.types';
import type { User } from '../types';

type Viewer = Pick<User, 'id' | 'role' | 'is_admin'> | null | undefined;

function isDispatcher(u: Viewer) {
  return !!u && (u.role === 'dispatcher' || u.is_admin);
}

export function canConfirmPayment(deal: Deal | undefined, user: Viewer): boolean {
  if (!deal || !isDispatcher(user)) return false;
  return deal.status === 'pending' && deal.payment?.status === 'qr_sent';
}

export function canReveal(deal: Deal | undefined, user: Viewer): boolean {
  if (!deal || !isDispatcher(user)) return false;
  return deal.status === 'paid';
}

export function canReplaceVehicle(deal: Deal | undefined, user: Viewer): boolean {
  if (!deal || !isDispatcher(user)) return false;
  if (deal.vehicleReplaced) return false;
  return deal.status === 'pending' || deal.status === 'paid';
}

export function canCancel(deal: Deal | undefined, user: Viewer): boolean {
  if (!deal || !isDispatcher(user)) return false;
  return deal.status !== 'documents_revealed' && deal.status !== 'cancelled';
}

export function canUploadQr(deal: Deal | undefined, user: Viewer): boolean {
  if (!deal || !isDispatcher(user)) return false;
  return deal.status === 'pending' && !!deal.payment;
}

export function canDownloadDoc(deal: Deal | undefined, user: Viewer): boolean {
  if (!deal || !user) return false;
  if (user.is_admin) return true;
  if (user.role === 'dispatcher') return true;
  if (user.role === 'carrier') return deal.vehicle?.carrierId === user.id;
  if (user.role === 'shipper') {
    return deal.shipperId === user.id && deal.status === 'documents_revealed';
  }
  return false;
}
