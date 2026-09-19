import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = SearchX, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
      <Icon className="h-10 w-10 text-ink-300" aria-hidden />
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}
