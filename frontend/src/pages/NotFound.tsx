import { Link } from "react-router-dom";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function NotFound() {
  useDocumentMeta({ title: "Página não encontrada — Concessionária" });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-extrabold text-brand-500">404</p>
      <h1 className="text-2xl font-bold text-ink-900">Página não encontrada</h1>
      <p className="max-w-sm text-ink-500">A página que você está procurando não existe ou foi removida.</p>
      <Link to="/" className="mt-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">
        Voltar para o início
      </Link>
    </div>
  );
}
