import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink-200/70", className)} />;
}

export function VehicleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-2 flex justify-between">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}
