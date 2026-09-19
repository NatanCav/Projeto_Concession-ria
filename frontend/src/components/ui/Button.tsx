import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500",
  secondary: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900",
  outline: "border border-ink-200 text-ink-900 hover:bg-ink-100 focus-visible:ring-ink-400",
  ghost: "text-ink-700 hover:bg-ink-100 focus-visible:ring-ink-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
