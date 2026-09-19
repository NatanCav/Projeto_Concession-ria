import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { SearchBar } from "@/components/catalog/SearchBar";
import { SortSelect } from "@/components/catalog/SortSelect";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { CatalogGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { SortOption, VehicleFilters } from "@/types/vehicle";

const PAGE_SIZE = 12;

function parseFilters(params: URLSearchParams): VehicleFilters {
  const get = (key: string) => params.get(key) ?? undefined;
  const getNumber = (key: string) => {
    const value = params.get(key);
    return value ? Number(value) : undefined;
  };

  return {
    q: get("q"),
    brandId: getNumber("brandId"),
    categoryId: getNumber("categoryId"),
    vehicleType: get("vehicleType") as VehicleFilters["vehicleType"],
    minYear: getNumber("minYear"),
    maxYear: getNumber("maxYear"),
    minPrice: getNumber("minPrice"),
    maxPrice: getNumber("maxPrice"),
    maxMileage: getNumber("maxMileage"),
    fuel: get("fuel") as VehicleFilters["fuel"],
    transmission: get("transmission") as VehicleFilters["transmission"],
    sort: (get("sort") as SortOption) ?? "recentes",
    page: getNumber("page") ?? 0,
    size: PAGE_SIZE,
  };
}

export function Catalog() {
  useDocumentMeta({
    title: "Catálogo de veículos — Concessionária",
    description: "Pesquise e filtre por marca, categoria, ano, preço, quilometragem, combustível e câmbio.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const { data, isLoading, isError, refetch, isPlaceholderData } = useVehicles(filters);

  const updateParams = (patch: Partial<VehicleFilters>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    setSearchParams(next);
  };

  const activeFilterCount = [
    filters.brandId,
    filters.categoryId,
    filters.vehicleType,
    filters.minYear,
    filters.maxYear,
    filters.minPrice,
    filters.maxPrice,
    filters.maxMileage,
    filters.fuel,
    filters.transmission,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Catálogo de veículos</h1>
        <p className="text-sm text-ink-500">
          {data ? `${data.totalElements} veículo(s) encontrado(s)` : "Buscando veículos..."}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="hidden lg:block lg:w-72 lg:shrink-0">
          <FilterSidebar filters={filters} onChange={updateParams} onClear={clearFilters} />
        </div>

        <div className="flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={filters.q ?? ""} onChange={(q) => updateParams({ q: q || undefined })} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-700 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <SortSelect value={filters.sort ?? "recentes"} onChange={(sort) => updateParams({ sort }, false)} />
            </div>
          </div>

          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <CatalogGridSkeleton />
          ) : !data || data.content.length === 0 ? (
            <EmptyState
              title="Nenhum veículo encontrado"
              description="Tente ajustar os filtros ou buscar por outro termo."
            />
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${isPlaceholderData ? "opacity-60" : ""}`}
              >
                {data.content.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onPageChange={(page) => updateParams({ page }, false)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-[85vw] max-w-sm overflow-y-auto bg-ink-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink-900">Filtros</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Fechar filtros"
                className="rounded-md p-1 text-ink-500 hover:bg-ink-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar filters={filters} onChange={updateParams} onClear={clearFilters} />
          </div>
          <button
            type="button"
            className="flex-1 bg-black/40"
            aria-label="Fechar"
            onClick={() => setMobileFiltersOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
