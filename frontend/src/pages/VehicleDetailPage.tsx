import { Link, useParams } from "react-router-dom";
import { Calendar, Fuel, Gauge, Hash, Palette, Settings2 } from "lucide-react";
import { useVehicleBySlug } from "@/hooks/useVehicle";
import { useSettings } from "@/hooks/useSettings";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { SpecsTable } from "@/components/vehicle/SpecsTable";
import { RelatedVehicles } from "@/components/vehicle/RelatedVehicles";
import { WhatsAppInterestButton } from "@/components/vehicle/WhatsAppInterestButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { formatCurrency, formatMileage } from "@/utils/format";
import { fuelLabels, statusBadgeStyles, statusLabels, transmissionLabels, vehicleTypeLabels } from "@/utils/labels";

export function VehicleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: vehicle, isLoading, isError, refetch } = useVehicleBySlug(slug);
  const { data: settings } = useSettings();

  useDocumentMeta({
    title: vehicle
      ? `${vehicle.brand.name} ${vehicle.model} ${vehicle.version} ${vehicle.year} — Concessionária`
      : "Detalhes do veículo",
    description: vehicle
      ? `${vehicle.brand.name} ${vehicle.model} ${vehicle.version}, ${vehicle.year}, ${formatMileage(vehicle.mileage)}, por ${formatCurrency(vehicle.promotionalPrice ?? vehicle.price)}.`
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="aspect-[4/3] w-full" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          title="Veículo não encontrado"
          description="Este veículo pode não estar mais disponível no catálogo."
          onRetry={refetch}
        />
        <div className="mt-6 text-center">
          <Link to="/veiculos" className="text-sm font-semibold text-brand-500 hover:underline">
            ← Voltar para o catálogo
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = vehicle.promotionalPrice ?? vehicle.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-ink-500">
        <Link to="/veiculos" className="hover:text-brand-500">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">
          {vehicle.brand.name} {vehicle.model}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VehicleGallery images={vehicle.images} vehicleName={`${vehicle.brand.name} ${vehicle.model}`} />
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-brand-50 text-brand-600">{vehicleTypeLabels[vehicle.vehicleType]}</Badge>
            <Badge className="bg-ink-100 text-ink-600">{vehicle.category.name}</Badge>
            {vehicle.status !== "DISPONIVEL" && (
              <Badge className={statusBadgeStyles[vehicle.status]}>{statusLabels[vehicle.status]}</Badge>
            )}
            {vehicle.featured && <Badge className="bg-brand-500 text-white">Destaque</Badge>}
          </div>

          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-brand-500">{vehicle.brand.name}</p>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{vehicle.model}</h1>
          <p className="text-ink-500">{vehicle.version}</p>

          <div className="mt-4">
            {vehicle.promotionalPrice && (
              <p className="text-sm text-ink-400 line-through">{formatCurrency(vehicle.price)}</p>
            )}
            <p className="text-3xl font-extrabold text-ink-900">{formatCurrency(displayPrice)}</p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
            <InfoItem icon={Calendar} label="Ano" value={String(vehicle.year)} />
            <InfoItem icon={Gauge} label="Quilometragem" value={formatMileage(vehicle.mileage)} />
            <InfoItem icon={Fuel} label="Combustível" value={fuelLabels[vehicle.fuel]} />
            <InfoItem icon={Settings2} label="Câmbio" value={transmissionLabels[vehicle.transmission]} />
            {vehicle.color && <InfoItem icon={Palette} label="Cor" value={vehicle.color} />}
            {vehicle.licensePlateLastDigits && (
              <InfoItem icon={Hash} label="Final da placa" value={vehicle.licensePlateLastDigits} />
            )}
          </dl>

          {settings?.whatsapp && (
            <div className="mt-6">
              <WhatsAppInterestButton vehicle={vehicle} whatsapp={settings.whatsapp} />
            </div>
          )}
        </div>
      </div>

      {vehicle.description && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-ink-900">Descrição</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{vehicle.description}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold text-ink-900">Ficha técnica</h2>
        <SpecsTable specifications={vehicle.specifications} />
      </section>

      <RelatedVehicles vehicleId={vehicle.id} />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <div>
        <dt className="text-xs text-ink-400">{label}</dt>
        <dd className="font-medium text-ink-800">{value}</dd>
      </div>
    </div>
  );
}
