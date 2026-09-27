import { apiClient } from "./apiClient";
import { resolveMediaUrl } from "@/utils/media";
import type { DashboardSummary, StoreSummary } from "@/types/dashboard";

export const dashboardService = {
  async getSummary(brandId?: number): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>("/admin/dashboard/summary", {
      params: brandId ? { brandId } : undefined,
    });
    return data;
  },

  async getStores(): Promise<StoreSummary[]> {
    const { data } = await apiClient.get<StoreSummary[]>("/admin/dashboard/stores");
    return data.map((store) => ({ ...store, logoUrl: resolveMediaUrl(store.logoUrl) }));
  },
};
