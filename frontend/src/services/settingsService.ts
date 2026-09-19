import { apiClient } from "./apiClient";
import type { DealershipSettings } from "@/types/settings";

export const settingsService = {
  async get(): Promise<DealershipSettings> {
    const { data } = await apiClient.get<DealershipSettings>("/settings");
    return data;
  },

  async update(values: DealershipSettings): Promise<DealershipSettings> {
    const { data } = await apiClient.put<DealershipSettings>("/settings", values);
    return data;
  },
};
