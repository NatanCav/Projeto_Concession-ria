import { useEffect } from "react";
import { analyticsService } from "@/services/analyticsService";
import { AUTH_TOKEN_STORAGE_KEY } from "@/services/apiClient";

const SESSION_KEY = "concessionaria.viewed";

function readViewed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function markViewed(key: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...readViewed(), key]));
  } catch {
    // Storage blocked (private mode): the view is still counted, just not de-duplicated.
  }
}

function isStaffBrowsing(): boolean {
  try {
    return !!localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return false;
  }
}

/** Counts a store/vehicle page view at most once per session; staff logged into the panel are not counted. */
export function useTrackView(target: { brandId?: number; vehicleId?: number } | undefined) {
  const brandId = target?.brandId;
  const vehicleId = target?.vehicleId;

  useEffect(() => {
    if (!brandId && !vehicleId) return;
    if (isStaffBrowsing()) return;
    const key = vehicleId ? `v:${vehicleId}` : `b:${brandId}`;
    if (readViewed().includes(key)) return;
    markViewed(key);
    analyticsService.recordView(vehicleId ? { vehicleId } : { brandId }).catch(() => undefined);
  }, [brandId, vehicleId]);
}
