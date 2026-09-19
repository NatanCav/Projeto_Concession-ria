import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicleService";
import type { AdminVehicleFilters, VehicleFormValues, VehicleStatus } from "@/types/vehicle";

export function useAdminVehicles(filters: AdminVehicleFilters) {
  return useQuery({
    queryKey: ["admin", "vehicles", filters],
    queryFn: () => vehicleService.searchAdmin(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminVehicle(id: number | undefined) {
  return useQuery({
    queryKey: ["admin", "vehicle", id],
    queryFn: () => vehicleService.getById(id!),
    enabled: !!id,
  });
}

function useInvalidateVehicles() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "vehicle"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };
}

export function useCreateVehicle() {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: (values: VehicleFormValues) => vehicleService.create(values),
    onSuccess: invalidate,
  });
}

export function useUpdateVehicle(id: number) {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: (values: VehicleFormValues) => vehicleService.update(id, values),
    onSuccess: invalidate,
  });
}

export function useDeleteVehicle() {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: (id: number) => vehicleService.remove(id),
    onSuccess: invalidate,
  });
}

export function useUpdateVehicleStatus() {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: VehicleStatus }) => vehicleService.updateStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useUpdateVehicleFeatured() {
  const invalidate = useInvalidateVehicles();
  return useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) => vehicleService.updateFeatured(id, featured),
    onSuccess: invalidate,
  });
}
