import { Link } from "react-router-dom";
import { Fuel, Gauge, Settings2 } from "lucide-react";
import type { VehicleSummary } from "@/types/vehicle";
import { formatCurrency, formatMileage } from "@/utils/format";
import { fuelLabels, statusBadgeStyles, statusLabels, transmissionLabels } from "@/utils/labels";
import { Badge } from "@/components/ui/Badge";

export function VehicleCard({ vehicle }: { vehicle: VehicleSummary }) {
  const showStatusBadge = vehicle.status !== "DISPONIVEL";

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-popover">
      <Link to={`/veiculos/${vehicle.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-ink-100">
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
        {vehicle.featured && (
          <Badge className="absolute left-3 top-3 bg-brand-500 text-white shadow">Destaque</Badge>
        )}
        {showStatusBadge && (
          <Badge className={`absolute right-3 top-3 ${statusBadgeStyles[vehicle.status]}`}>
            {statusLabels[vehicle.status]}
          </Badge>
        )}
      </Link>

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
            className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
