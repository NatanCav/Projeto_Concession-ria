import { apiClient } from "./apiClient";
import type { PageResponse } from "@/types/common";
import type { Lead, LeadFilters } from "@/types/lead";

function toQueryParams<T extends object>(filters: T) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = String(value);
    }
  });
  return params;
}

export const leadService = {
  async register(vehicleId: number): Promise<void> {
    await apiClient.post("/leads", { vehicleId });
  },

  async searchAdmin(filters: LeadFilters): Promise<PageResponse<Lead>> {
    const { data } = await apiClient.get<PageResponse<Lead>>("/admin/leads", {
      params: toQueryParams(filters),
    });
    return data;
  },
};
