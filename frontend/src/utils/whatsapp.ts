interface WhatsappVehicleInfo {
  brandName: string;
  model: string;
  version: string;
  year: number;
  url: string;
}

export function buildWhatsappUrl(whatsapp: string, vehicle: WhatsappVehicleInfo): string {
  const digits = whatsapp.replace(/\D/g, "");
  const message =
    `Olá! Tenho interesse no veículo ${vehicle.brandName} ${vehicle.model} ${vehicle.version} ` +
    `${vehicle.year}, anunciado no catálogo (${vehicle.url}). Gostaria de receber mais informações.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildGenericWhatsappUrl(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const message = "Olá! Gostaria de mais informações sobre os veículos disponíveis.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
