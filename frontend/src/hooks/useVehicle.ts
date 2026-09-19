import { useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicleService";

export function useVehicleBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["vehicle", "slug", slug],
    queryFn: () => vehicleService.getBySlug(slug!),
    enabled: !!slug,
  });
}

export function useRelatedVehicles(vehicleId: number | undefined, limit = 4) {
  return useQuery({
    queryKey: ["vehicles", "related", vehicleId, limit],
    queryFn: () => vehicleService.getRelated(vehicleId!, limit),
    enabled: !!vehicleId,
  });
}
