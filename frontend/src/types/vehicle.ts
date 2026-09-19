import type { Brand } from "./brand";
import type { Category } from "./category";

export type VehicleType = "CARRO" | "MOTO" | "CAMINHAO";

export type FuelType = "FLEX" | "GASOLINA" | "ETANOL" | "DIESEL" | "HIBRIDO" | "ELETRICO" | "GNV";

export type TransmissionType = "MANUAL" | "AUTOMATICO" | "AUTOMATIZADO" | "CVT" | "SEMI_AUTOMATICO";

export type VehicleStatus = "DISPONIVEL" | "RESERVADO" | "VENDIDO" | "INATIVO";

export type SortOption = "recentes" | "menor-preco" | "maior-preco" | "menor-km" | "maior-km";

export interface VehicleSummary {
  id: number;
  slug: string;
  brandName: string;
  categoryName: string;
  vehicleType: VehicleType;
  model: string;
  version: string;
  year: number;
  mileage: number;
  price: number;
  promotionalPrice: number | null;
  fuel: FuelType;
  transmission: TransmissionType;
  status: VehicleStatus;
  featured: boolean;
  primaryImageUrl: string | null;
}

export interface VehicleImage {
  id: number;
  imageUrl: string;
  primary: boolean;
  displayOrder: number;
}

export interface TechnicalSpecification {
  engine?: string | null;
  displacement?: string | null;
  horsepower?: string | null;
  torque?: string | null;
  traction?: string | null;
  urbanConsumption?: number | null;
  highwayConsumption?: number | null;
  fuelTankCapacity?: number | null;
  doors?: number | null;
  seats?: number | null;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface VehicleDetail {
  id: number;
  slug: string;
  brand: Brand;
  category: Category;
  vehicleType: VehicleType;
  model: string;
  version: string;
  year: number;
  mileage: number;
  price: number;
  promotionalPrice: number | null;
  fuel: FuelType;
  transmission: TransmissionType;
  color: string | null;
  licensePlateLastDigits: string | null;
  description: string | null;
  status: VehicleStatus;
  featured: boolean;
  images: VehicleImage[];
  specifications: TechnicalSpecification | null;
  createdAt: string;
}

export interface VehicleFilters {
  brandId?: number;
  categoryId?: number;
  vehicleType?: VehicleType;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  q?: string;
  sort?: SortOption;
  page?: number;
  size?: number;
}

export interface AdminVehicleFilters {
  brandId?: number;
  categoryId?: number;
  vehicleType?: VehicleType;
  status?: VehicleStatus;
  q?: string;
  sort?: SortOption;
  page?: number;
  size?: number;
}

export interface VehicleFormValues {
  brandId: number;
  categoryId: number;
  vehicleType: VehicleType;
  model: string;
  version: string;
  year: number;
  mileage: number;
  price: number;
  promotionalPrice?: number | null;
  fuel: FuelType;
  transmission: TransmissionType;
  color?: string;
  licensePlateLastDigits?: string;
  description?: string;
  status: VehicleStatus;
  featured: boolean;
  specifications?: TechnicalSpecification;
}
