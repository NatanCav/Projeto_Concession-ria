export interface DailyCount {
  date: string;
  count: number;
}

export interface TopVehicle {
  id: number;
  label: string;
  slug: string;
  views: number;
}

export interface DashboardFinancials {
  revenue: number;
  profit: number;
  stockValue: number;
  soldCount: number;
  soldWithoutCost: number;
  revenueLast30Days: number;
  soldLast30Days: number;
}

export interface DashboardSummary {
  brandId: number | null;
  brandName: string | null;
  totalVehicles: number;
  available: number;
  reserved: number;
  sold: number;
  inactive: number;
  featuredCount: number;
  totalLeads: number;
  visitsLast30Days: number;
  visitsByDay: DailyCount[];
  topVehicles: TopVehicle[];
  financials: DashboardFinancials;
}

export interface StoreSummary {
  brandId: number;
  brandName: string;
  logoUrl: string | null;
  active: boolean;
  totalVehicles: number;
  available: number;
  sold: number;
  sellers: number;
  visitsLast30Days: number;
  leads: number;
  revenue: number;
  profit: number;
}
