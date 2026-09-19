import { apiClient } from "./apiClient";
import { resolveMediaUrl } from "@/utils/media";
import type { Brand, BrandFormValues } from "@/types/brand";

function withResolvedLogo(brand: Brand): Brand {
  return { ...brand, logoUrl: resolveMediaUrl(brand.logoUrl) };
}

export const brandService = {
  async list(includeInactive = false): Promise<Brand[]> {
    const { data } = await apiClient.get<Brand[]>("/brands", { params: { includeInactive } });
    return data.map(withResolvedLogo);
  },

  async create(values: BrandFormValues): Promise<Brand> {
    const { data } = await apiClient.post<Brand>("/brands", values);
    return withResolvedLogo(data);
  },

  async update(id: number, values: BrandFormValues): Promise<Brand> {
    const { data } = await apiClient.put<Brand>(`/brands/${id}`, values);
    return withResolvedLogo(data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  },
};
