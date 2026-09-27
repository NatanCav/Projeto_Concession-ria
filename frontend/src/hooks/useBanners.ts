import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/services/bannerService";
import type { BannerFormValues } from "@/types/banner";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerService.listPublic(),
    staleTime: 5 * 60_000,
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ["admin", "banners"],
    queryFn: () => bannerService.listAdmin(),
  });
}

export function useBannerMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  const create = useMutation({
    mutationFn: ({ file, values }: { file: File; values: BannerFormValues }) => bannerService.create(file, values),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: BannerFormValues }) => bannerService.update(id, values),
    onSuccess: invalidate,
  });

  const replaceImage = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => bannerService.replaceImage(id, file),
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (ids: number[]) => bannerService.reorder(ids),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => bannerService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, replaceImage, reorder, remove };
}
