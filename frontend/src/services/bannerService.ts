import { apiClient } from "./apiClient";
import { resolveMediaUrl } from "@/utils/media";
import type { Banner, BannerFormValues } from "@/types/banner";

function withResolvedImage(banner: Banner): Banner {
  return { ...banner, imageUrl: resolveMediaUrl(banner.imageUrl) };
}

export const bannerService = {
  async listPublic(): Promise<Banner[]> {
    const { data } = await apiClient.get<Banner[]>("/banners");
    return data.map(withResolvedImage);
  },

  async listAdmin(): Promise<Banner[]> {
    const { data } = await apiClient.get<Banner[]>("/admin/banners");
    return data.map(withResolvedImage);
  },

  async create(file: File, values: BannerFormValues): Promise<Banner> {
    const formData = new FormData();
    formData.append("file", file);
    if (values.title) formData.append("title", values.title);
    if (values.subtitle) formData.append("subtitle", values.subtitle);
    if (values.linkUrl) formData.append("linkUrl", values.linkUrl);
    formData.append("active", String(values.active));
    const { data } = await apiClient.post<Banner>("/admin/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return withResolvedImage(data);
  },

  async update(id: number, values: BannerFormValues): Promise<Banner> {
    const { data } = await apiClient.put<Banner>(`/admin/banners/${id}`, values);
    return withResolvedImage(data);
  },

  async replaceImage(id: number, file: File): Promise<Banner> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<Banner>(`/admin/banners/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return withResolvedImage(data);
  },

  async reorder(ids: number[]): Promise<Banner[]> {
    const { data } = await apiClient.patch<Banner[]>("/admin/banners/order", { ids });
    return data.map(withResolvedImage);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/banners/${id}`);
  },
};
