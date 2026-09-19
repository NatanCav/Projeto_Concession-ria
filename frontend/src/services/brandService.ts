import { apiClient } from "./apiClient";
import type { Brand, BrandFormValues } from "@/types/brand";

export const brandService = {
  async list(includeInactive = false): Promise<Brand[]> {
    const { data } = await apiClient.get<Brand[]>("/brands", { params: { includeInactive } });
    return data;
  },

  async create(values: BrandFormValues): Promise<Brand> {
    const { data } = await apiClient.post<Brand>("/brands", values);
    return data;
  },

  async update(id: number, values: BrandFormValues): Promise<Brand> {
    const { data } = await apiClient.put<Brand>(`/brands/${id}`, values);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/brands/${id}`);
  },
};
