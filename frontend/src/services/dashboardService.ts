import { apiClient } from "./apiClient";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>("/admin/dashboard/summary");
    return data;
  },
};
