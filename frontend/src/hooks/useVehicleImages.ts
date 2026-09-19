import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/services/vehicleService";

export function useVehicleImageMutations(vehicleId: number) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "vehicle", vehicleId] });

  const upload = useMutation({
    mutationFn: (files: File[]) => vehicleService.uploadImages(vehicleId, files),
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (imageIds: number[]) => vehicleService.reorderImages(vehicleId, imageIds),
    onSuccess: invalidate,
  });

  const setPrimary = useMutation({
    mutationFn: (imageId: number) => vehicleService.setPrimaryImage(vehicleId, imageId),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (imageId: number) => vehicleService.deleteImage(vehicleId, imageId),
    onSuccess: invalidate,
  });

  return { upload, reorder, setPrimary, remove };
}
