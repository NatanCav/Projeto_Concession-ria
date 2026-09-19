import type { FuelType, SortOption, TransmissionType, VehicleStatus, VehicleType } from "@/types/vehicle";

export const vehicleTypeLabels: Record<VehicleType, string> = {
  CARRO: "Carro",
  MOTO: "Moto",
  CAMINHAO: "Caminhão",
};

export const fuelLabels: Record<FuelType, string> = {
  FLEX: "Flex",
  GASOLINA: "Gasolina",
  ETANOL: "Etanol",
  DIESEL: "Diesel",
  HIBRIDO: "Híbrido",
  ELETRICO: "Elétrico",
  GNV: "GNV",
};

export const transmissionLabels: Record<TransmissionType, string> = {
  MANUAL: "Manual",
  AUTOMATICO: "Automático",
  AUTOMATIZADO: "Automatizado",
  CVT: "CVT",
  SEMI_AUTOMATICO: "Semi-automático",
};

export const statusLabels: Record<VehicleStatus, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  INATIVO: "Inativo",
};

export const statusBadgeStyles: Record<VehicleStatus, string> = {
  DISPONIVEL: "bg-emerald-100 text-emerald-700",
  RESERVADO: "bg-amber-100 text-amber-700",
  VENDIDO: "bg-ink-200 text-ink-600",
  INATIVO: "bg-ink-200 text-ink-500",
};

export const sortOptionLabels: Record<SortOption, string> = {
  recentes: "Mais recentes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "menor-km": "Menor quilometragem",
  "maior-km": "Maior quilometragem",
};
