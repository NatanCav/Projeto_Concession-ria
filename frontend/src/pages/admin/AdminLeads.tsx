import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAdminLeads } from "@/hooks/useLead";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/utils/format";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { LeadFilters } from "@/types/lead";

export function AdminLeads() {
  useDocumentMeta({ title: "Interesses — Painel administrativo" });

  const [filters, setFilters] = useState<LeadFilters>({ page: 0, size: 20 });
  const { data, isLoading, isError, refetch } = useAdminLeads(filters);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Interesses</h1>
        <p className="mt-1 text-sm text-ink-500">
          Pessoas que clicaram em "Tenho interesse" e foram encaminhadas para o WhatsApp.
        </p>
      </div>

      {isError ? (
        <ErrorState title="Não foi possível carregar os interesses" onRetry={refetch} />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-500">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <span className="font-semibold text-ink-900">{data?.totalElements ?? 0}</span> interesse(s)
                registrado(s) no total
              </>
            )}
          </p>

          <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
            {!isLoading && data?.content.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  icon={MessageCircle}
                  title="Nenhum interesse recebido ainda."
                  description="Assim que alguém clicar em 'Tenho interesse' no site, o registro aparecerá aqui."
                />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3">Data/hora</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3" colSpan={3}>
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))}

                  {data?.content.map((lead) => (
                    <tr key={lead.id} className="hover:bg-ink-50/60">
                      <td className="px-4 py-3 font-medium text-ink-900">{lead.vehicleLabel}</td>
                      <td className="px-4 py-3 text-ink-600">{formatDateTime(lead.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {lead.vehicleId ? (
                          <Link
                            to={`/admin/veiculos/${lead.vehicleId}/editar`}
                            className="text-sm font-semibold text-brand-500 hover:underline"
                          >
                            Ver veículo
                          </Link>
                        ) : (
                          <span className="text-sm text-ink-400">Veículo removido</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
