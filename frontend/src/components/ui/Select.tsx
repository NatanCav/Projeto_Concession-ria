import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900",
            "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";
