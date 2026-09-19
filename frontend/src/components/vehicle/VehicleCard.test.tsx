import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { VehicleCard } from "./VehicleCard";
import { sampleVehicle } from "@/tests/mocks/handlers";

describe("VehicleCard", () => {
  it("renders brand, model, price and a link to the detail page", () => {
    renderWithProviders(<VehicleCard vehicle={sampleVehicle} />);

    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Corolla")).toBeInTheDocument();
    expect(screen.getByText("R$ 129.900")).toBeInTheDocument();
    expect(screen.getByText("Destaque")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links.some((link) => link.getAttribute("href") === "/veiculos/toyota-corolla-xei-2023")).toBe(true);
  });

  it("shows the promotional price and strikes through the original price when discounted", () => {
    renderWithProviders(<VehicleCard vehicle={{ ...sampleVehicle, price: 100000, promotionalPrice: 90000 }} />);

    expect(screen.getByText("R$ 90.000")).toBeInTheDocument();
    expect(screen.getByText("R$ 100.000")).toBeInTheDocument();
  });

  it("shows a status badge when the vehicle is not available", () => {
    renderWithProviders(<VehicleCard vehicle={{ ...sampleVehicle, status: "RESERVADO" }} />);
    expect(screen.getByText("Reservado")).toBeInTheDocument();
  });
});
