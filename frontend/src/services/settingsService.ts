import { apiClient } from "./apiClient";
import { resolveMediaUrl } from "@/utils/media";
import type { DealershipSettings } from "@/types/settings";

export const settingsService = {
  async get(): Promise<DealershipSettings> {
    const { data } = await apiClient.get<DealershipSettings>("/settings");
    return { ...data, logoUrl: resolveMediaUrl(data.logoUrl) };
  },

  async update(values: DealershipSettings): Promise<DealershipSettings> {
    const { data } = await apiClient.put<DealershipSettings>("/settings", values);
    return { ...data, logoUrl: resolveMediaUrl(data.logoUrl) };
  },
};
