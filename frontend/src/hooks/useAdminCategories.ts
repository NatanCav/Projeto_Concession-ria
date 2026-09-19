import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import type { CategoryFormValues } from "@/types/category";

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const create = useMutation({
    mutationFn: (values: CategoryFormValues) => categoryService.create(values),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: CategoryFormValues }) => categoryService.update(id, values),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
