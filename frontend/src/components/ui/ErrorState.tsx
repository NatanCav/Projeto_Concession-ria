import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Não foi possível carregar os dados",
  description = "Verifique sua conexão e tente novamente em instantes.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-6 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden />
      <h3 className="text-base font-semibold text-red-700">{title}</h3>
      <p className="max-w-sm text-sm text-red-600/80">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
