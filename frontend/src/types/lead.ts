export interface Lead {
  id: number;
  vehicleId: number | null;
  vehicleLabel: string;
  createdAt: string;
}

export interface LeadFilters {
  page?: number;
  size?: number;
}
