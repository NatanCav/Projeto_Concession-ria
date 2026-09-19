import { http, HttpResponse } from "msw";
import type { VehicleSummary } from "@/types/vehicle";

const API_BASE = "http://localhost:8080/api";

export const sampleVehicle: VehicleSummary = {
  id: 1,
  slug: "toyota-corolla-xei-2023",
  brandName: "Toyota",
  categoryName: "Sedan",
  vehicleType: "CARRO",
  model: "Corolla",
  version: "XEi 2.0",
  year: 2023,
  mileage: 15000,
  price: 129900,
  promotionalPrice: null,
  fuel: "FLEX",
  transmission: "AUTOMATICO",
  status: "DISPONIVEL",
  featured: true,
  primaryImageUrl: "https://example.com/corolla.jpg",
};

export const handlers = [
  http.get(`${API_BASE}/vehicles`, () => {
    return HttpResponse.json({
      content: [sampleVehicle],
      page: 0,
      size: 12,
      totalElements: 1,
      totalPages: 1,
      last: true,
    });
  }),

  http.get(`${API_BASE}/vehicles/featured`, () => HttpResponse.json([sampleVehicle])),
  http.get(`${API_BASE}/vehicles/recent`, () => HttpResponse.json([sampleVehicle])),

  http.get(`${API_BASE}/brands`, () =>
    HttpResponse.json([{ id: 1, name: "Toyota", logoUrl: null, active: true }]),
  ),

  http.get(`${API_BASE}/categories`, () =>
    HttpResponse.json([{ id: 1, name: "Sedan", active: true }]),
  ),

  http.get(`${API_BASE}/settings`, () =>
    HttpResponse.json({
      dealershipName: "Prime Motors",
      logoUrl: null,
      whatsapp: "5511999999999",
      phone: null,
      instagram: null,
      address: null,
      city: null,
      state: null,
      openingHours: null,
      description: null,
    }),
  ),
];
