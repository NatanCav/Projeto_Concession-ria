import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { fuelLabels, transmissionLabels, vehicleTypeLabels } from "@/utils/labels";
import type { FuelType, TransmissionType, VehicleFilters, VehicleType } from "@/types/vehicle";

interface FilterSidebarProps {
  filters: VehicleFilters;
  onChange: (patch: Partial<VehicleFilters>) => void;
  onClear: () => void;
}

export function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-700">Filtros</h2>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-brand-500 hover:underline">
          Limpar
        </button>
      </div>

      <Select
        label="Tipo de veículo"
        name="vehicleType"
        value={filters.vehicleType ?? ""}
        onChange={(e) => onChange({ vehicleType: (e.target.value || undefined) as VehicleType | undefined })}
      >
        <option value="">Todos</option>
        {Object.entries(vehicleTypeLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Marca"
        name="brandId"
        value={filters.brandId ?? ""}
        onChange={(e) => onChange({ brandId: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Todas</option>
        {brands?.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </Select>

      <Select
        label="Categoria"
        name="categoryId"
        value={filters.categoryId ?? ""}
        onChange={(e) => onChange({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Todas</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ano mínimo"
          name="minYear"
          type="number"
          value={filters.minYear ?? ""}
          onChange={(e) => onChange({ minYear: e.target.value ? Number(e.target.value) : undefined })}
        />
        <Input
          label="Ano máximo"
          name="maxYear"
          type="number"
          value={filters.maxYear ?? ""}
          onChange={(e) => onChange({ maxYear: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Preço mínimo"
          name="minPrice"
          type="number"
          value={filters.minPrice ?? ""}
          onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
        />
        <Input
          label="Preço máximo"
          name="maxPrice"
          type="number"
          value={filters.maxPrice ?? ""}
          onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <Input
        label="Quilometragem máxima"
        name="maxMileage"
        type="number"
        value={filters.maxMileage ?? ""}
        onChange={(e) => onChange({ maxMileage: e.target.value ? Number(e.target.value) : undefined })}
      />

      <Select
        label="Combustível"
        name="fuel"
        value={filters.fuel ?? ""}
        onChange={(e) => onChange({ fuel: (e.target.value || undefined) as FuelType | undefined })}
      >
        <option value="">Todos</option>
        {Object.entries(fuelLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        label="Câmbio"
        name="transmission"
        value={filters.transmission ?? ""}
        onChange={(e) => onChange({ transmission: (e.target.value || undefined) as TransmissionType | undefined })}
      >
        <option value="">Todos</option>
        {Object.entries(transmissionLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Button variant="outline" onClick={onClear} className="mt-1">
        Limpar filtros
      </Button>
    </aside>
  );
}
