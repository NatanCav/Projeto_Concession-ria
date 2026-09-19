import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | undefined;
  accent?: string;
  isLoading?: boolean;
}

export function StatCard({ icon: Icon, label, value, accent = "bg-brand-500", isLoading }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-5 shadow-card">
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-lg text-white", accent)}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-7 w-12" />
        ) : (
          <p className="text-2xl font-extrabold text-ink-900">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}
