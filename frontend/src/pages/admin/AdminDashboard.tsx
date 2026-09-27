import { Link, useSearchParams } from "react-router-dom";
import { Banknote, Eye, MessageCircle, Package, Pencil, Plus, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useAdminVehicles } from "@/hooks/useAdminVehicles";
import { useBrands } from "@/hooks/useBrands";
import { useAuth } from "@/context/AuthContext";
import { VisitsChart } from "@/components/admin/VisitsChart";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
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
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBrandId = isAdmin && searchParams.get("brandId") ? Number(searchParams.get("brandId")) : undefined;

  const { data: brands } = useBrands(true);
  const { data, isLoading, isError, refetch } = useDashboardSummary(selectedBrandId);
  const { data: recentVehicles, isLoading: isLoadingRecent } = useAdminVehicles({
    page: 0,
    size: 5,
    sort: "recentes",
    brandId: selectedBrandId,
  });

  const firstName = user?.name?.split(" ")[0];
  const total = data?.totalVehicles ?? 0;
  const financials = data?.financials;
  const scopeLabel = isAdmin
    ? selectedBrandId
      ? `Loja ${data?.brandName ?? ""}`
      : "Todas as lojas"
    : `Loja ${user?.brandName ?? ""}`;

  const changeStore = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("brandId", value);
    else next.delete("brandId");
    setSearchParams(next);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{firstName ? `Olá, ${firstName}` : "Visão geral"}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isAdmin
              ? "Acompanhe visitas, vendas e estoque de cada loja."
              : "Acompanhe as visitas, as vendas e o estoque da sua loja."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {isAdmin && (
            <div className="sm:w-56">
              <Select
                aria-label="Filtrar por loja"
                value={selectedBrandId ?? ""}
                onChange={(event) => changeStore(event.target.value)}
              >
                <option value="">Todas as lojas</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <Link
            to="/admin/veiculos/novo"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" /> Novo veículo
          </Link>
        </div>
      </div>

      {isError ? (
        <ErrorState title="Não foi possível carregar os indicadores" onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl bg-ink-950 p-6 text-white">
              <div className="flex items-center gap-2 text-ink-400">
                <Eye className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Visitas · últimos 30 dias</p>
              </div>
              {isLoading ? (
                <Skeleton className="mt-3 h-12 w-28 bg-ink-800" />
              ) : (
                <p className="mt-2 text-5xl font-extrabold">{(data?.visitsLast30Days ?? 0).toLocaleString("pt-BR")}</p>
              )}
              <p className="mt-4 text-sm text-ink-300">{scopeLabel}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              <StatTile
                icon={Banknote}
                label="Receita com vendas"
                value={formatCurrency(financials?.revenue ?? 0)}
                hint={`${financials?.soldCount ?? 0} vendido(s) · ${formatCurrency(financials?.revenueLast30Days ?? 0)} nos últimos 30 dias`}
                isLoading={isLoading}
              />
              <StatTile
                icon={TrendingUp}
                label="Lucro"
                value={formatCurrency(financials?.profit ?? 0)}
                hint={
                  financials && financials.soldWithoutCost > 0
                    ? `${financials.soldWithoutCost} venda(s) sem preço de custo ficaram de fora`
                    : "Valor de venda menos preço de custo"
                }
                hintTone={financials && financials.soldWithoutCost > 0 ? "warning" : "muted"}
                isLoading={isLoading}
              />
              <StatTile
                icon={Package}
                label="Valor em estoque"
                value={formatCurrency(financials?.stockValue ?? 0)}
                hint={`${(data?.available ?? 0) + (data?.reserved ?? 0)} veículo(s) à venda`}
                isLoading={isLoading}
              />
              <StatTile
                icon={MessageCircle}
                label="Interesses via WhatsApp"
                value={String(data?.totalLeads ?? 0)}
                hint="Total acumulado"
                isLoading={isLoading}
                to="/admin/leads"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
              <h2 className="text-sm font-semibold text-ink-900">Visitas por dia</h2>
              <p className="mb-5 mt-0.5 text-xs text-ink-500">
                Acessos à página da loja e às páginas dos veículos, uma vez por visitante a cada sessão.
              </p>
              {isLoading || !data ? <Skeleton className="h-44 w-full" /> : <VisitsChart data={data.visitsByDay} />}
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="text-sm font-semibold text-ink-900">Veículos mais vistos</h2>
              <p className="mb-4 mt-0.5 text-xs text-ink-500">Últimos 30 dias</p>
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-full" />
                  ))}
                </div>
              ) : !data || data.topVehicles.length === 0 ? (
                <p className="text-sm text-ink-500">Sem visitas a veículos ainda.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {data.topVehicles.map((vehicle, index) => {
                    const pct = (vehicle.views / data.topVehicles[0].views) * 100;
                    return (
                      <li key={vehicle.id}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <Link
                            to={`/admin/veiculos/${vehicle.id}/editar`}
                            className="truncate font-medium text-ink-800 hover:text-brand-500"
                          >
                            <span className="mr-1.5 text-ink-400">{index + 1}.</span>
                            {vehicle.label}
                          </Link>
                          <span className="shrink-0 font-semibold text-ink-900">{vehicle.views}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-100">
                          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink-900">Composição do estoque</h2>
              {!isLoading && <p className="text-sm text-ink-500">{total} veículo(s) cadastrados</p>}
            </div>
            {isLoading ? (
              <Skeleton className="mt-4 h-3 w-full" />
            ) : total === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Nenhum veículo cadastrado ainda.</p>
            ) : (
              <>
                <div className="mt-4 flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-ink-100">
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
                        <img src={vehicle.primaryImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
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

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  hintTone = "muted",
  isLoading,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  hintTone?: "muted" | "warning";
  isLoading?: boolean;
  to?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <p className="mt-1 truncate text-2xl font-extrabold text-ink-900 sm:text-3xl">{value}</p>
      )}
      <p className={cn("mt-1 text-xs", hintTone === "warning" ? "font-medium text-amber-600" : "text-ink-400")}>
        {isLoading ? "" : hint}
      </p>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="flex min-w-0 flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5">{content}</div>;
}
