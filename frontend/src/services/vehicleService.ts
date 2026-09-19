import { apiClient } from "./apiClient";
import type { PageResponse } from "@/types/common";
import type {
  AdminVehicleFilters,
  TechnicalSpecification,
  VehicleDetail,
  VehicleFilters,
  VehicleFormValues,
  VehicleImage,
  VehicleStatus,
  VehicleSummary,
} from "@/types/vehicle";

function toQueryParams<T extends object>(filters: T) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = String(value);
    }
  });
  return params;
}

export const vehicleService = {
  async search(filters: VehicleFilters): Promise<PageResponse<VehicleSummary>> {
    const { data } = await apiClient.get<PageResponse<VehicleSummary>>("/vehicles", {
      params: toQueryParams(filters),
    });
    return data;
  },

  async searchAdmin(filters: AdminVehicleFilters): Promise<PageResponse<VehicleSummary>> {
    const { data } = await apiClient.get<PageResponse<VehicleSummary>>("/vehicles/admin", {
      params: toQueryParams(filters),
    });
    return data;
  },

  async getBySlug(slug: string): Promise<VehicleDetail> {
    const { data } = await apiClient.get<VehicleDetail>(`/vehicles/slug/${slug}`);
    return data;
  },

  async getById(id: number): Promise<VehicleDetail> {
    const { data } = await apiClient.get<VehicleDetail>(`/vehicles/${id}`);
    return data;
  },

  async getFeatured(limit = 8): Promise<VehicleSummary[]> {
    const { data } = await apiClient.get<VehicleSummary[]>("/vehicles/featured", { params: { limit } });
    return data;
  },

  async getRecent(limit = 8): Promise<VehicleSummary[]> {
    const { data } = await apiClient.get<VehicleSummary[]>("/vehicles/recent", { params: { limit } });
    return data;
  },

  async getRelated(vehicleId: number, limit = 4): Promise<VehicleSummary[]> {
    const { data } = await apiClient.get<VehicleSummary[]>(`/vehicles/${vehicleId}/related`, { params: { limit } });
    return data;
  },

  async create(values: VehicleFormValues): Promise<VehicleDetail> {
    const { data } = await apiClient.post<VehicleDetail>("/vehicles", values);
    return data;
  },

  async update(id: number, values: VehicleFormValues): Promise<VehicleDetail> {
    const { data } = await apiClient.put<VehicleDetail>(`/vehicles/${id}`, values);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },

  async updateStatus(id: number, status: VehicleStatus): Promise<VehicleDetail> {
    const { data } = await apiClient.patch<VehicleDetail>(`/vehicles/${id}/status`, { status });
    return data;
  },

  async updateFeatured(id: number, featured: boolean): Promise<VehicleDetail> {
    const { data } = await apiClient.patch<VehicleDetail>(`/vehicles/${id}/featured`, { featured });
    return data;
  },

  async upsertSpecifications(id: number, specs: TechnicalSpecification): Promise<VehicleDetail> {
    const { data } = await apiClient.put<VehicleDetail>(`/vehicles/${id}/specifications`, specs);
    return data;
  },

  async uploadImages(vehicleId: number, files: File[]): Promise<VehicleImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await apiClient.post<VehicleImage[]>(`/vehicles/${vehicleId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async reorderImages(vehicleId: number, imageIds: number[]): Promise<VehicleImage[]> {
    const { data } = await apiClient.patch<VehicleImage[]>(`/vehicles/${vehicleId}/images/order`, { imageIds });
    return data;
  },

  async setPrimaryImage(vehicleId: number, imageId: number): Promise<VehicleImage[]> {
    const { data } = await apiClient.patch<VehicleImage[]>(`/vehicles/${vehicleId}/images/${imageId}/primary`);
    return data;
  },

  async deleteImage(vehicleId: number, imageId: number): Promise<VehicleImage[]> {
    const { data } = await apiClient.delete<VehicleImage[]>(`/vehicles/${vehicleId}/images/${imageId}`);
    return data;
  },
};
