import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicleService";
import type { VehicleFilters } from "@/types/vehicle";

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => vehicleService.search(filters),
    placeholderData: keepPreviousData,
  });
}

export function useFeaturedVehicles(limit = 8) {
  return useQuery({
    queryKey: ["vehicles", "featured", limit],
    queryFn: () => vehicleService.getFeatured(limit),
  });
}

export function useRecentVehicles(limit = 8) {
  return useQuery({
    queryKey: ["vehicles", "recent", limit],
    queryFn: () => vehicleService.getRecent(limit),
  });
}
