import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "left" | "right";
  /** Hides the built-in title bar/close button when the content supplies its own (title stays as an accessible, visually-hidden label). */
  hideHeader?: boolean;
  children?: ReactNode;
  className?: string;
}

const sideStyles: Record<NonNullable<SheetProps["side"]>, string> = {
  left: "left-0 data-[state=open]:animate-slide-in-left",
  right: "right-0 data-[state=open]:animate-slide-in-right",
};

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  side = "left",
  hideHeader,
  children,
  className,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-950/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed top-0 z-50 flex h-full w-[min(85vw,360px)] flex-col shadow-popover focus:outline-none",
            sideStyles[side],
            className,
          )}
        >
          {hideHeader ? (
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
          ) : (
            <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-4 py-4">
              <Dialog.Title className="text-base font-semibold text-ink-900">{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Fechar"
                  className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          )}
          {description && <Dialog.Description className="sr-only">{description}</Dialog.Description>}
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
