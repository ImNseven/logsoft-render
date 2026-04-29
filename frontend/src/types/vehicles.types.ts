export type DocType =
  | 'tech_passport_truck'
  | 'tech_passport_trailer'
  | 'passport'
  | 'permit_kat'
  | 'chip'
  | 'other';

export interface VehicleCarrier {
  id: string;
  full_name: string | null;
  phone: string;
  company_name?: string | null;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  docType: DocType;
  fileName: string;
  mimeType?: string | null;
  uploadedBy?: string;
  createdAt: string;
}

export interface VehicleTransportType {
  id: number;
  name: string;
}

export interface Vehicle {
  id: string;
  carrierId: string;
  carrier: VehicleCarrier;
  plateNumber: string;
  transportTypeId?: number | null;
  transportType?: VehicleTransportType | null;
  capacityKg?: number | string | null;
  specs?: string | null;
  isActive: boolean;
  documents?: VehicleDocument[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleDto {
  carrierId?: string;
  plateNumber: string;
  transportTypeId?: number;
  capacityKg?: number;
  specs?: string;
}

export interface QueryVehiclesParams {
  carrierId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
