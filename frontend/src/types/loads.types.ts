export type LoadStatus = 'active' | 'in_deal' | 'completed' | 'cancelled';

export interface LoadShipper {
  id: string;
  full_name: string | null;
  phone: string;
  company_name?: string | null;
}

export interface LoadOriginPoint {
  id: number;
  name: string;
}

export interface LoadTransportType {
  id: number;
  name: string;
}

export interface Load {
  id: string;
  shipperId: string;
  shipper: LoadShipper;
  originPoint: LoadOriginPoint;
  destination: string;
  transportType?: LoadTransportType | null;
  weightKg?: number | string | null;
  volumeM3?: number | string | null;
  readyDate?: string | null;
  status: LoadStatus;
  notes?: string | null;
  createdAt: string;
}

export interface CreateLoadDto {
  shipperId?: string;
  originPointId: number;
  destination: string;
  transportTypeId?: number;
  weightKg?: number;
  volumeM3?: number;
  readyDate?: string;
  notes?: string;
}

export interface QueryLoadsParams {
  status?: LoadStatus;
  shipperId?: string;
  originPointId?: number;
  transportTypeId?: number;
  page?: number;
  limit?: number;
}
