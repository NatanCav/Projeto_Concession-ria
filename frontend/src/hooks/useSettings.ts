import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settingsService";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.get(),
    staleTime: 5 * 60_000,
  });
}
