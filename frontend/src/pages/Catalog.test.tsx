import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { server } from "@/tests/mocks/server";
import { Catalog } from "./Catalog";

const API_BASE = "http://localhost:8080/api";

describe("Catalog page", () => {
  it("shows vehicles returned by the API", async () => {
    renderWithProviders(<Catalog />, { route: "/veiculos" });

    await waitFor(() => {
      expect(screen.getByText("Corolla")).toBeInTheDocument();
    });
    expect(screen.getByText("1 veículo(s) encontrado(s)")).toBeInTheDocument();
  });

  it("shows an empty state when no vehicles match the filters", async () => {
    server.use(
      http.get(`${API_BASE}/vehicles`, () =>
        HttpResponse.json({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0, last: true }),
      ),
    );

    renderWithProviders(<Catalog />, { route: "/veiculos?q=inexistente" });

    await waitFor(() => {
      expect(screen.getByText("Nenhum veículo encontrado")).toBeInTheDocument();
    });
  });

  it("shows an error state when the API call fails", async () => {
    server.use(http.get(`${API_BASE}/vehicles`, () => HttpResponse.error()));

    renderWithProviders(<Catalog />, { route: "/veiculos" });

    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar os dados")).toBeInTheDocument();
    });
  });
});
