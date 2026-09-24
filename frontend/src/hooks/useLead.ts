import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { leadService } from "@/services/leadService";
import type { LeadFilters } from "@/types/lead";

export function useRegisterLead() {
  return useMutation({
    mutationFn: (vehicleId: number) => leadService.register(vehicleId),
  });
}

export function useAdminLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: ["admin", "leads", filters],
    queryFn: () => leadService.searchAdmin(filters),
    placeholderData: keepPreviousData,
  });
}
