import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  useAdminVehicles,
  useDeleteVehicle,
  useUpdateVehicleFeatured,
  useUpdateVehicleStatus,
} from "@/hooks/useAdminVehicles";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/context/AuthContext";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatMileage } from "@/utils/format";
import { statusBadgeStyles, statusLabels } from "@/utils/labels";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { extractErrorMessage } from "@/services/apiClient";
import type { AdminVehicleFilters, VehicleStatus, VehicleSummary } from "@/types/vehicle";

const STATUS_OPTIONS: VehicleStatus[] = ["DISPONIVEL", "RESERVADO", "VENDIDO", "INATIVO"];

export function AdminVehicleList() {
  useDocumentMeta({ title: "Veículos — Painel administrativo" });

  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");

  const [filters, setFilters] = useState<AdminVehicleFilters>({ page: 0, size: 10 });
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleSummary | null>(null);

  const { data, isLoading } = useAdminVehicles(filters);
  const { data: brands } = useBrands(true);
  const { data: categories } = useCategories(true);
  const deleteVehicle = useDeleteVehicle();
  const updateStatus = useUpdateVehicleStatus();
  const updateFeatured = useUpdateVehicleFeatured();

  const patchFilters = (patch: Partial<AdminVehicleFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 0 }));

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle.mutateAsync(vehicleToDelete.id);
      toast.success("Veículo excluído com sucesso.");
      setVehicleToDelete(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível excluir o veículo."));
    }
  };

  const handleStatusChange = async (vehicle: VehicleSummary, status: VehicleStatus) => {
    try {
      await updateStatus.mutateAsync({ id: vehicle.id, status });
      toast.success("Status atualizado.");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível atualizar o status."));
    }
  };

  const handleFeaturedToggle = async (vehicle: VehicleSummary) => {
    try {
      await updateFeatured.mutateAsync({ id: vehicle.id, featured: !vehicle.featured });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível atualizar o destaque."));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Veículos</h1>
        <Link
          to="/admin/veiculos/novo"
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Novo veículo
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-ink-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Buscar..."
          value={filters.q ?? ""}
          onChange={(e) => patchFilters({ q: e.target.value || undefined })}
        />
        <Select value={filters.status ?? ""} onChange={(e) => patchFilters({ status: (e.target.value || undefined) as VehicleStatus })}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.brandId ?? ""}
          onChange={(e) => patchFilters({ brandId: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Todas as marcas</option>
          {brands?.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.categoryId ?? ""}
          onChange={(e) => patchFilters({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Todas as categorias</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Veículo</th>
              <th className="px-4 py-3">Ano</th>
              <th className="px-4 py-3">KM</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Destaque</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-3" colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && data?.content.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10">
                  <EmptyState title="Nenhum veículo cadastrado" />
                </td>
              </tr>
            )}

            {data?.content.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">
                    {vehicle.brandName} {vehicle.model}
                  </p>
                  <p className="text-xs text-ink-500">{vehicle.version}</p>
                </td>
                <td className="px-4 py-3">{vehicle.year}</td>
                <td className="px-4 py-3">{formatMileage(vehicle.mileage)}</td>
                <td className="px-4 py-3">{formatCurrency(vehicle.promotionalPrice ?? vehicle.price)}</td>
                <td className="px-4 py-3">
                  <select
                    value={vehicle.status}
                    onChange={(e) => handleStatusChange(vehicle, e.target.value as VehicleStatus)}
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${statusBadgeStyles[vehicle.status]}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleFeaturedToggle(vehicle)}
                      aria-label={vehicle.featured ? "Remover destaque" : "Marcar como destaque"}
                      className={vehicle.featured ? "text-amber-500" : "text-ink-300 hover:text-amber-400"}
                    >
                      <Star className="h-5 w-5" fill={vehicle.featured ? "currentColor" : "none"} />
                    </button>
                  ) : (
                    <Star
                      className="h-5 w-5 text-ink-300"
                      fill={vehicle.featured ? "currentColor" : "none"}
                      aria-label={vehicle.featured ? "Em destaque" : "Sem destaque"}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/veiculos/${vehicle.id}/editar`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setVehicleToDelete(vehicle)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={(page) => patchFilters({ page })} />
        </div>
      )}

      <ConfirmDialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
        title="Excluir veículo"
        description={`Tem certeza que deseja excluir "${vehicleToDelete?.brandName} ${vehicleToDelete?.model}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={deleteVehicle.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
