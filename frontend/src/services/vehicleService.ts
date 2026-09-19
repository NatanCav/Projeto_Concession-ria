import { apiClient } from "./apiClient";
import { resolveMediaUrl } from "@/utils/media";
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

function withResolvedSummaryImage(summary: VehicleSummary): VehicleSummary {
  return { ...summary, primaryImageUrl: resolveMediaUrl(summary.primaryImageUrl) };
}

function withResolvedImage(image: VehicleImage): VehicleImage {
  return { ...image, imageUrl: resolveMediaUrl(image.imageUrl) };
}

function withResolvedDetailImages(detail: VehicleDetail): VehicleDetail {
  return { ...detail, images: detail.images.map(withResolvedImage) };
}

function withResolvedPage(page: PageResponse<VehicleSummary>): PageResponse<VehicleSummary> {
  return { ...page, content: page.content.map(withResolvedSummaryImage) };
}

export const vehicleService = {
  async search(filters: VehicleFilters): Promise<PageResponse<VehicleSummary>> {
    const { data } = await apiClient.get<PageResponse<VehicleSummary>>("/vehicles", {
      params: toQueryParams(filters),
    });
    return withResolvedPage(data);
  },

  async searchAdmin(filters: AdminVehicleFilters): Promise<PageResponse<VehicleSummary>> {
    const { data } = await apiClient.get<PageResponse<VehicleSummary>>("/vehicles/admin", {
      params: toQueryParams(filters),
    });
    return withResolvedPage(data);
  },

  async getBySlug(slug: string): Promise<VehicleDetail> {
    const { data } = await apiClient.get<VehicleDetail>(`/vehicles/slug/${slug}`);
    return withResolvedDetailImages(data);
  },

  async getById(id: number): Promise<VehicleDetail> {
    const { data } = await apiClient.get<VehicleDetail>(`/vehicles/${id}`);
    return withResolvedDetailImages(data);
  },

  async getFeatured(limit = 8): Promise<VehicleSummary[]> {
    const { data } = await apiClient.get<VehicleSummary[]>("/vehicles/featured", { params: { limit } });
    return data.map(withResolvedSummaryImage);
  },

  async getRecent(limit = 8): Promise<VehicleSummary[]> {
    const { data } = await apiClient.get<VehicleSummary[]>("/vehicles/recent", { params: { limit } });
    return data.map(withResolvedSummaryImage);
  },

  async getRelated(vehicleId: number, limit = 4): Promise<VehicleSummary[]> {
    const { data } = await apiClient.get<VehicleSummary[]>(`/vehicles/${vehicleId}/related`, { params: { limit } });
    return data.map(withResolvedSummaryImage);
  },

  async create(values: VehicleFormValues): Promise<VehicleDetail> {
    const { data } = await apiClient.post<VehicleDetail>("/vehicles", values);
    return withResolvedDetailImages(data);
  },

  async update(id: number, values: VehicleFormValues): Promise<VehicleDetail> {
    const { data } = await apiClient.put<VehicleDetail>(`/vehicles/${id}`, values);
    return withResolvedDetailImages(data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },

  async updateStatus(id: number, status: VehicleStatus): Promise<VehicleDetail> {
    const { data } = await apiClient.patch<VehicleDetail>(`/vehicles/${id}/status`, { status });
    return withResolvedDetailImages(data);
  },

  async updateFeatured(id: number, featured: boolean): Promise<VehicleDetail> {
    const { data } = await apiClient.patch<VehicleDetail>(`/vehicles/${id}/featured`, { featured });
    return withResolvedDetailImages(data);
  },

  async upsertSpecifications(id: number, specs: TechnicalSpecification): Promise<VehicleDetail> {
    const { data } = await apiClient.put<VehicleDetail>(`/vehicles/${id}/specifications`, specs);
    return withResolvedDetailImages(data);
  },

  async uploadImages(vehicleId: number, files: File[]): Promise<VehicleImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const { data } = await apiClient.post<VehicleImage[]>(`/vehicles/${vehicleId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.map(withResolvedImage);
  },

  async reorderImages(vehicleId: number, imageIds: number[]): Promise<VehicleImage[]> {
    const { data } = await apiClient.patch<VehicleImage[]>(`/vehicles/${vehicleId}/images/order`, { imageIds });
    return data.map(withResolvedImage);
  },

  async setPrimaryImage(vehicleId: number, imageId: number): Promise<VehicleImage[]> {
    const { data } = await apiClient.patch<VehicleImage[]>(`/vehicles/${vehicleId}/images/${imageId}/primary`);
    return data.map(withResolvedImage);
  },

  async deleteImage(vehicleId: number, imageId: number): Promise<VehicleImage[]> {
    const { data } = await apiClient.delete<VehicleImage[]>(`/vehicles/${vehicleId}/images/${imageId}`);
    return data.map(withResolvedImage);
  },
};
