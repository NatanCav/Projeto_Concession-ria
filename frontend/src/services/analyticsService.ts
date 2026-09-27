import { apiClient } from "./apiClient";

export interface PageViewTarget {
  brandId?: number;
  vehicleId?: number;
}

export const analyticsService = {
  async recordView(target: PageViewTarget): Promise<void> {
    await apiClient.post("/analytics/views", target);
  },
};
