export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Consulte";
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatMileage(value: number): string {
  return `${value.toLocaleString("pt-BR")} km`;
}

export function formatMeasurement(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value.toLocaleString("pt-BR")} ${unit}`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
