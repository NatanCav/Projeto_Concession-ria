import { apiClient } from "./apiClient";

export const leadService = {
  async register(vehicleId: number): Promise<void> {
    await apiClient.post("/leads", { vehicleId });
  },
};
