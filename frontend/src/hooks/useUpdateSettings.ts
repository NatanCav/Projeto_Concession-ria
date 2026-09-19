import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settingsService";
import type { DealershipSettings } from "@/types/settings";

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: DealershipSettings) => settingsService.update(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}
