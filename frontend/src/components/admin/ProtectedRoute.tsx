import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
