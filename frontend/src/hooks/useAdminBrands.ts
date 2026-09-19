import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandService } from "@/services/brandService";
import type { BrandFormValues } from "@/types/brand";

export function useBrandMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["brands"] });

  const create = useMutation({
    mutationFn: (values: BrandFormValues) => brandService.create(values),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: BrandFormValues }) => brandService.update(id, values),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => brandService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
