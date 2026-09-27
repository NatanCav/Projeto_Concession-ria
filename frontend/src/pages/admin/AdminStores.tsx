import { Link } from "react-router-dom";
import { BarChart3, ExternalLink, Store, UserPlus } from "lucide-react";
import { useStoreSummaries } from "@/hooks/useDashboard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/format";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { cn } from "@/utils/cn";

export function AdminStores() {
  useDocumentMeta({ title: "Lojas — Painel administrativo" });
  const { data: stores, isLoading, isError, refetch } = useStoreSummaries();

  const totals = stores?.reduce(
    (acc, store) => ({
      visits: acc.visits + store.visitsLast30Days,
      revenue: acc.revenue + store.revenue,
      profit: acc.profit + store.profit,
      withoutSeller: acc.withoutSeller + (store.sellers === 0 ? 1 : 0),
    }),
    { visits: 0, revenue: 0, profit: 0, withoutSeller: 0 },
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Lojas</h1>
          <p className="mt-1 text-sm text-ink-500">
            Cada marca é uma loja com página própria no site. Vendedores enxergam apenas a loja a que estão vinculados.
          </p>
        </div>
        <Link
          to="/admin/usuarios"
          className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-900 hover:bg-ink-100"
        >
          <UserPlus className="h-4 w-4" /> Vincular vendedor
        </Link>
      </div>

      {isError ? (
        <ErrorState title="Não foi possível carregar as lojas" onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Summary label="Lojas" value={isLoading ? undefined : String(stores?.length ?? 0)} />
            <Summary
              label="Visitas · 30 dias"
              value={isLoading ? undefined : (totals?.visits ?? 0).toLocaleString("pt-BR")}
            />
            <Summary label="Receita total" value={isLoading ? undefined : formatCurrency(totals?.revenue ?? 0)} />
            <Summary label="Lucro total" value={isLoading ? undefined : formatCurrency(totals?.profit ?? 0)} />
          </div>

          {!!totals?.withoutSeller && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {totals.withoutSeller} loja(s) ainda sem vendedor vinculado. Crie o acesso em{" "}
              <Link to="/admin/usuarios" className="font-semibold underline">
                Usuários
              </Link>
              .
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
            {!isLoading && stores?.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={Store}
                  title="Nenhuma loja cadastrada"
                  description="Cadastre uma marca em Estoque > Marcas para criar a primeira loja."
                />
              </div>
            ) : (
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Loja</th>
                    <th className="px-4 py-3 text-right">Estoque</th>
                    <th className="px-4 py-3 text-right">Vendidos</th>
                    <th className="px-4 py-3 text-right">Visitas 30d</th>
                    <th className="px-4 py-3 text-right">Interesses</th>
                    <th className="px-4 py-3 text-right">Receita</th>
                    <th className="px-4 py-3 text-right">Lucro</th>
                    <th className="px-4 py-3">Vendedores</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3" colSpan={9}>
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))}
                  {stores?.map((store) => (
                    <tr key={store.brandId} className="hover:bg-ink-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {store.logoUrl ? (
                            <img src={store.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600">
                              {store.brandName.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-ink-900">{store.brandName}</p>
                            {!store.active && <p className="text-xs text-ink-400">Marca inativa</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {store.available}
                        <span className="text-ink-400"> / {store.totalVehicles}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{store.sold}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {store.visitsLast30Days.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{store.leads}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(store.revenue)}</td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-semibold tabular-nums",
                          store.profit < 0 ? "text-red-600" : "text-ink-900",
                        )}
                      >
                        {formatCurrency(store.profit)}
                      </td>
                      <td className="px-4 py-3">
                        {store.sellers > 0 ? (
                          <span className="text-ink-700">{store.sellers}</span>
                        ) : (
                          <span className="font-medium text-amber-600">Nenhum</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin?brandId=${store.brandId}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                            aria-label={`Ver indicadores da loja ${store.brandName}`}
                            title="Ver indicadores"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/lojas/${store.brandId}`}
                            target="_blank"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                            aria-label={`Abrir a página pública da loja ${store.brandName}`}
                            title="Abrir página da loja"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="min-w-0 rounded-2xl border border-ink-100 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      {value === undefined ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <p className="mt-1 truncate text-2xl font-extrabold text-ink-900">{value}</p>
      )}
    </div>
  );
}
