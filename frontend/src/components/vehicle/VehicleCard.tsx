import { Link } from "react-router-dom";
import { ArrowRight, Fuel, Gauge, Heart, Settings2 } from "lucide-react";
import type { VehicleSummary } from "@/types/vehicle";
import { formatCurrency, formatMileage } from "@/utils/format";
import { fuelLabels, statusBadgeStyles, statusLabels, transmissionLabels } from "@/utils/labels";
import { Badge } from "@/components/ui/Badge";
import { useFavoriteVehicles } from "@/hooks/useFavoriteVehicles";
import { cn } from "@/utils/cn";

export function VehicleCard({ vehicle }: { vehicle: VehicleSummary }) {
  const showStatusBadge = vehicle.status !== "DISPONIVEL";
  const { isFavorite, toggleFavorite } = useFavoriteVehicles();
  const favorite = isFavorite(vehicle.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-popover">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <Link
          to={`/veiculos/${vehicle.slug}`}
          className="absolute inset-0 block"
          aria-label={`${vehicle.brandName} ${vehicle.model} ${vehicle.version}`}
        >
          {vehicle.primaryImageUrl ? (
            <img
              src={vehicle.primaryImageUrl}
              alt={`${vehicle.brandName} ${vehicle.model} ${vehicle.version}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">Sem foto</div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {vehicle.featured && <Badge className="bg-brand-500 text-white shadow">Destaque</Badge>}
          {showStatusBadge && (
            <Badge className={statusBadgeStyles[vehicle.status]}>{statusLabels[vehicle.status]}</Badge>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(vehicle.id)}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={favorite}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition-colors hover:bg-white",
            favorite ? "text-brand-500" : "text-ink-400",
          )}
        >
          <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{vehicle.brandName}</p>
          <h3 className="text-base font-bold text-ink-900">{vehicle.model}</h3>
          <p className="line-clamp-2 text-sm text-ink-500">{vehicle.version}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
          <span>{vehicle.year}</span>
          <span className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" /> {formatMileage(vehicle.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {fuelLabels[vehicle.fuel]}
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" /> {transmissionLabels[vehicle.transmission]}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {vehicle.promotionalPrice && (
              <p className="text-xs text-ink-400 line-through">{formatCurrency(vehicle.price)}</p>
            )}
            <p className="text-lg font-extrabold text-ink-900">
              {formatCurrency(vehicle.promotionalPrice ?? vehicle.price)}
            </p>
          </div>
          <Link
            to={`/veiculos/${vehicle.slug}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink-100 px-3.5 text-sm font-semibold text-ink-700 transition-colors group-hover:bg-brand-500 group-hover:text-white"
          >
            Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
