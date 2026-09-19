import { useRelatedVehicles } from "@/hooks/useVehicle";
import { VehicleCard } from "./VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/Skeleton";

export function RelatedVehicles({ vehicleId }: { vehicleId: number }) {
  const { data: related, isLoading } = useRelatedVehicles(vehicleId);

  if (!isLoading && (!related || related.length === 0)) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold text-ink-900">Veículos semelhantes</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <VehicleCardSkeleton key={index} />)
          : related!.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
      </div>
    </section>
  );
}
