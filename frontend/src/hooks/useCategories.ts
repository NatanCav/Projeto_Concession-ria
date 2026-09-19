import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: ["categories", { includeInactive }],
    queryFn: () => categoryService.list(includeInactive),
    staleTime: 5 * 60_000,
  });
}
