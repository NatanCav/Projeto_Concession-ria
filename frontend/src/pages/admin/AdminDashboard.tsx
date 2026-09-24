import { Link } from "react-router-dom";
import { MessageCircle, Pencil, Plus, Star } from "lucide-react";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useAdminVehicles } from "@/hooks/useAdminVehicles";
import { useAuth } from "@/context/AuthContext";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatMileage } from "@/utils/format";
import { statusBadgeStyles, statusLabels } from "@/utils/labels";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { cn } from "@/utils/cn";

const STOCK_SEGMENTS: { key: "available" | "reserved" | "sold" | "inactive"; label: string; barClass: string; dotClass: string }[] = [
  { key: "available", label: "Disponíveis", barClass: "bg-emerald-500", dotClass: "bg-emerald-500" },
  { key: "reserved", label: "Reservados", barClass: "bg-amber-500", dotClass: "bg-amber-500" },
  { key: "sold", label: "Vendidos", barClass: "bg-ink-400", dotClass: "bg-ink-400" },
  { key: "inactive", label: "Inativos", barClass: "bg-ink-200", dotClass: "bg-ink-200" },
];

export function AdminDashboard() {
  useDocumentMeta({ title: "Visão geral — Painel administrativo" });
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboardSummary();
  const { data: recentVehicles, isLoading: isLoadingRecent } = useAdminVehicles({
    page: 0,
    size: 5,
    sort: "recentes",
  });

  const firstName = user?.name?.split(" ")[0];
  const total = data?.totalVehicles ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            {firstName ? `Olá, ${firstName}` : "Visão geral"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">Acompanhe o estoque e a operação da concessionária.</p>
        </div>
        <Link
          to="/admin/veiculos/novo"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Novo veículo
        </Link>
      </div>

      {isError ? (
        <ErrorState title="Não foi possível carregar os indicadores" onRetry={refetch} />
      ) : (
        <>
          {/* Resumo da operação: estoque total em destaque + métricas secundárias */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl bg-ink-950 p-6 text-white lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Estoque total</p>
              {isLoading ? (
                <Skeleton className="mt-3 h-10 w-24 bg-ink-800" />
              ) : (
                <p className="mt-2 text-5xl font-extrabold">{total}</p>
              )}
              <p className="mt-4 text-sm text-ink-300">
                {isLoading ? "" : `${data?.available ?? 0} disponíveis para venda agora`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
              <SecondaryStat
                icon={Star}
                label="Em destaque"
                value={data?.featuredCount}
                isLoading={isLoading}
                hint="Aparecem na home"
              />
              <SecondaryStat
                icon={MessageCircle}
                label="Interesses via WhatsApp"
                value={data?.totalLeads}
                isLoading={isLoading}
                hint="Total acumulado"
                to="/admin/leads"
              />
            </div>
          </div>

          {/* Composição do estoque */}
          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-ink-900">Composição do estoque</h2>
            {isLoading ? (
              <Skeleton className="mt-4 h-3 w-full" />
            ) : total === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Nenhum veículo cadastrado ainda.</p>
            ) : (
              <>
                <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-ink-100">
                  {STOCK_SEGMENTS.map((segment) => {
                    const value = data?.[segment.key] ?? 0;
                    const pct = total > 0 ? (value / total) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={segment.key}
                        className={segment.barClass}
                        style={{ width: `${pct}%` }}
                        title={`${segment.label}: ${value}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {STOCK_SEGMENTS.map((segment) => {
                    const value = data?.[segment.key] ?? 0;
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={segment.key} className="flex items-center gap-2 text-sm">
                        <span className={cn("h-2 w-2 rounded-full", segment.dotClass)} />
                        <span className="text-ink-600">{segment.label}</span>
                        <span className="font-semibold text-ink-900">{value}</span>
                        <span className="text-ink-400">({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* Veículos recém-cadastrados */}
          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Veículos recém-cadastrados</h2>
              <Link to="/admin/veiculos" className="text-sm font-semibold text-brand-500 hover:underline">
                Ver todos
              </Link>
            </div>

            {isLoadingRecent ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : !recentVehicles || recentVehicles.content.length === 0 ? (
              <EmptyState title="Nenhum veículo cadastrado ainda" />
            ) : (
              <div className="flex flex-col divide-y divide-ink-100">
                {recentVehicles.content.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      {vehicle.primaryImageUrl ? (
                        <img
                          src={vehicle.primaryImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-400">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {vehicle.brandName} {vehicle.model}
                      </p>
                      <p className="truncate text-xs text-ink-500">{vehicle.version}</p>
                    </div>
                    <Badge className={cn("shrink-0", statusBadgeStyles[vehicle.status])}>
                      {statusLabels[vehicle.status]}
                    </Badge>
                    <p className="hidden w-28 shrink-0 text-right text-sm font-semibold text-ink-900 sm:block">
                      {formatCurrency(vehicle.promotionalPrice ?? vehicle.price)}
                    </p>
                    <p className="hidden w-20 shrink-0 text-right text-xs text-ink-400 md:block">
                      {formatMileage(vehicle.mileage)}
                    </p>
                    <Link
                      to={`/admin/veiculos/${vehicle.id}/editar`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                      aria-label={`Editar ${vehicle.brandName} ${vehicle.model}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SecondaryStat({
  icon: Icon,
  label,
  value,
  isLoading,
  hint,
  to,
}: {
  icon: typeof Star;
  label: string;
  value: number | undefined;
  isLoading?: boolean;
  hint: string;
  to?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-14" />
      ) : (
        <p className="mt-1 text-3xl font-extrabold text-ink-900">{value ?? 0}</p>
      )}
      <p className="mt-1 text-xs text-ink-400">{hint}</p>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="flex flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5">{content}</div>;
}
