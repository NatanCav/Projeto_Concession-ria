import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";

export function useDashboardSummary(brandId?: number) {
  return useQuery({
    queryKey: ["admin", "dashboard", "summary", brandId ?? "all"],
    queryFn: () => dashboardService.getSummary(brandId),
    placeholderData: keepPreviousData,
  });
}

export function useStoreSummaries() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stores"],
    queryFn: () => dashboardService.getStores(),
  });
}
