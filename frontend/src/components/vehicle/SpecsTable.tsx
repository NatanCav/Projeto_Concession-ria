import type { TechnicalSpecification } from "@/types/vehicle";
import { formatMeasurement } from "@/utils/format";

interface SpecsTableProps {
  specifications: TechnicalSpecification | null;
}

export function SpecsTable({ specifications }: SpecsTableProps) {
  if (!specifications) {
    return <p className="text-sm text-ink-500">Ficha técnica não informada para este veículo.</p>;
  }

  const rows: [string, string | null | undefined][] = [
    ["Motor", specifications.engine],
    ["Cilindrada", specifications.displacement],
    ["Potência", specifications.horsepower],
    ["Torque", specifications.torque],
    ["Tração", specifications.traction],
    ["Consumo urbano", formatMeasurement(specifications.urbanConsumption, "km/l")],
    ["Consumo rodoviário", formatMeasurement(specifications.highwayConsumption, "km/l")],
    ["Capacidade do tanque", formatMeasurement(specifications.fuelTankCapacity, "L")],
    ["Portas", specifications.doors?.toString() ?? null],
    ["Lugares", specifications.seats?.toString() ?? null],
    ["Peso", formatMeasurement(specifications.weight, "kg")],
    ["Comprimento", formatMeasurement(specifications.length, "mm")],
    ["Largura", formatMeasurement(specifications.width, "mm")],
    ["Altura", formatMeasurement(specifications.height, "mm")],
  ];

  const filled = rows.filter(([, value]) => value && value !== "—");

  if (filled.length === 0) {
    return <p className="text-sm text-ink-500">Ficha técnica não informada para este veículo.</p>;
  }

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
      {filled.map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-ink-100 pb-2 text-sm">
          <dt className="text-ink-500">{label}</dt>
          <dd className="font-medium text-ink-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
