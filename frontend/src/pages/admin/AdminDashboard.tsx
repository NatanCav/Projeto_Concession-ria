import { Car, CheckCircle2, Clock, MessageCircle, Star, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { StatCard } from "@/components/admin/StatCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function AdminDashboard() {
  useDocumentMeta({ title: "Dashboard — Painel administrativo" });
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Dashboard</h1>
        <Link
          to="/admin/veiculos/novo"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Novo veículo
        </Link>
      </div>

      {isError ? (
        <ErrorState title="Não foi possível carregar os indicadores" onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Car} label="Total de veículos" value={data?.totalVehicles} isLoading={isLoading} />
          <StatCard
            icon={CheckCircle2}
            label="Disponíveis"
            value={data?.available}
            accent="bg-emerald-500"
            isLoading={isLoading}
          />
          <StatCard
            icon={Clock}
            label="Reservados"
            value={data?.reserved}
            accent="bg-amber-500"
            isLoading={isLoading}
          />
          <StatCard
            icon={XCircle}
            label="Vendidos"
            value={data?.sold}
            accent="bg-ink-500"
            isLoading={isLoading}
          />
          <StatCard icon={Star} label="Em destaque" value={data?.featuredCount} accent="bg-purple-500" isLoading={isLoading} />
          <StatCard
            icon={MessageCircle}
            label="Interesses via WhatsApp"
            value={data?.totalLeads}
            accent="bg-emerald-600"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
