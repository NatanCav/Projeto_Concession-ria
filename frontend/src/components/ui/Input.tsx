import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400",
            "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {hint && !error && <span className="text-xs text-ink-500">{hint}</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
