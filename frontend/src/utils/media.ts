/**
 * The backend returns image URLs as root-relative paths (e.g. "/uploads/vehicles/1/a.png")
 * since it doesn't know its own public origin. In local dev the frontend (Vite, :5173) and
 * the backend (:8080) run on different origins, so a plain <img src="/uploads/..."> would
 * resolve against the frontend's own origin and 404. This resolves such paths against the
 * API's origin (derived from VITE_API_BASE_URL) so images load regardless of environment.
 */
function apiOrigin(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
  try {
    return new URL(base, window.location.origin).origin;
  } catch {
    return "";
  }
}

export function resolveMediaUrl<T extends string | null | undefined>(path: T): T {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return (apiOrigin() + normalized) as T;
}
