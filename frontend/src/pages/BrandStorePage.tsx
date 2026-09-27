import { Link, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle, Store } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { useVehicles } from "@/hooks/useVehicles";
import { useSettings } from "@/hooks/useSettings";
import { useTrackView } from "@/hooks/useTrackView";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { SortSelect } from "@/components/catalog/SortSelect";
import { CatalogGridSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { buildGenericWhatsappUrl } from "@/utils/whatsapp";
import type { SortOption } from "@/types/vehicle";

const PAGE_SIZE = 12;

export function BrandStorePage() {
  const { brandId: brandIdParam } = useParams<{ brandId: string }>();
  const brandId = Number(brandIdParam);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 0);
  const sort = (searchParams.get("sort") as SortOption | null) ?? "recentes";

  const { data: brands, isLoading: isLoadingBrands } = useBrands();
  const { data: settings } = useSettings();
  const brand = brands?.find((item) => item.id === brandId);
  const { data, isLoading, isError, refetch, isPlaceholderData } = useVehicles({
    brandId,
    sort,
    page,
    size: PAGE_SIZE,
  });

  useTrackView(brand ? { brandId: brand.id } : undefined);
  useDocumentMeta({
    title: brand ? `Loja ${brand.name} — Veículos à venda` : "Loja",
    description: brand
      ? `Confira os veículos ${brand.name} disponíveis, com fotos, preços e ficha técnica.`
      : undefined,
  });

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setSearchParams(next);
  };

  if (!isLoadingBrands && !brand) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Store}
          title="Loja não encontrada"
          description="Esta loja pode ter sido desativada."
          action={
            <Link to="/veiculos" className="text-sm font-semibold text-brand-500 hover:underline">
              Ver todo o catálogo →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <section className="bg-ink-950 text-white">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between md:py-14">
          <div className="flex items-center gap-4">
            {brand?.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-xl font-extrabold">
                {brand ? brand.name.slice(0, 2).toUpperCase() : ""}
              </span>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Loja oficial</p>
              {brand ? (
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{brand.name}</h1>
              ) : (
                <Skeleton className="mt-1 h-9 w-48 bg-ink-800" />
              )}
              <p className="mt-1 text-sm text-ink-300">
                {data ? `${data.totalElements} veículo(s) à venda` : "Carregando estoque..."}
              </p>
            </div>
          </div>
          {settings?.whatsapp && brand && (
            <a
              href={buildGenericWhatsappUrl(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-900 transition-colors hover:bg-ink-100"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a loja
            </a>
          )}
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="text-sm text-ink-500">
            <Link to="/veiculos" className="hover:text-brand-500">
              Catálogo
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-700">{brand?.name}</span>
          </nav>
          <SortSelect value={sort} onChange={(value) => updateParams({ sort: value, page: undefined })} />
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <CatalogGridSkeleton />
        ) : !data || data.content.length === 0 ? (
          <EmptyState title="Nenhum veículo à venda nesta loja no momento" />
        ) : (
          <>
            <div
              className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}
            >
              {data.content.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(next) => updateParams({ page: next > 0 ? String(next) : undefined })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
