import { Select } from "@/components/ui/Select";
import { sortOptionLabels } from "@/utils/labels";
import type { SortOption } from "@/types/vehicle";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select
      aria-label="Ordenar por"
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="w-full sm:w-56"
    >
      {Object.entries(sortOptionLabels).map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </Select>
  );
}
