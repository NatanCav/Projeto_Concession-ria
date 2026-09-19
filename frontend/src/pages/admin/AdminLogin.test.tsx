import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { server } from "@/tests/mocks/server";
import { AdminLogin } from "./AdminLogin";

const API_BASE = "http://localhost:8080/api";

describe("AdminLogin", () => {
  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLogin />, { route: "/admin/login" });

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail é obrigatório")).toBeInTheDocument();
    expect(await screen.findByText("Senha é obrigatória")).toBeInTheDocument();
  });

  it("shows an error toast when credentials are invalid", async () => {
    server.use(
      http.post(`${API_BASE}/auth/login`, () =>
        HttpResponse.json({ message: "Credenciais inválidas." }, { status: 401 }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<AdminLogin />, { route: "/admin/login" });

    await user.type(screen.getByLabelText("E-mail"), "admin@test.dev");
    await user.type(screen.getByLabelText("Senha"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getAllByText("Credenciais inválidas.").length).toBeGreaterThan(0);
    });
  });
});
