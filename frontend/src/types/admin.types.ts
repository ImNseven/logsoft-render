export interface UsersStats {
  total: number;
  shippers: number;
  carriers: number;
  dispatchers: number;
  admins: number;
  inactive: number;
}

export interface LoadsStats {
  total: number;
  active: number;
  in_deal: number;
  completed: number;
  cancelled: number;
}

export interface VehiclesStats {
  total: number;
  active: number;
  inactive: number;
}

export interface DealsStats {
  total: number;
  pending: number;
  paid: number;
  documents_revealed: number;
  cancelled: number;
}

export interface PaymentsStats {
  confirmed_total_amount: string;
  confirmed_count: number;
}

export interface AdminStats {
  users: UsersStats;
  loads: LoadsStats;
  vehicles: VehiclesStats;
  deals: DealsStats;
  payments: PaymentsStats;
}
