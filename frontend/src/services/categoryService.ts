import { apiClient } from "./apiClient";
import type { Category, CategoryFormValues } from "@/types/category";

export const categoryService = {
  async list(includeInactive = false): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>("/categories", { params: { includeInactive } });
    return data;
  },

  async create(values: CategoryFormValues): Promise<Category> {
    const { data } = await apiClient.post<Category>("/categories", values);
    return data;
  },

  async update(id: number, values: CategoryFormValues): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, values);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
