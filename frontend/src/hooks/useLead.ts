import { useMutation } from "@tanstack/react-query";
import { leadService } from "@/services/leadService";

export function useRegisterLead() {
  return useMutation({
    mutationFn: (vehicleId: number) => leadService.register(vehicleId),
  });
}
