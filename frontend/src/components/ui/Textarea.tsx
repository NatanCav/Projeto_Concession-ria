import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-24 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400",
            "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
