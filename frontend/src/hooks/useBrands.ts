import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brandService";

export function useBrands(includeInactive = false) {
  return useQuery({
    queryKey: ["brands", { includeInactive }],
    queryFn: () => brandService.list(includeInactive),
    staleTime: 5 * 60_000,
  });
}
