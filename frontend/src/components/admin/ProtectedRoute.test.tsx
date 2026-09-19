import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { server } from "@/tests/mocks/server";
import { AUTH_TOKEN_STORAGE_KEY } from "@/services/apiClient";
import { ProtectedRoute } from "./ProtectedRoute";

const API_BASE = "http://localhost:8080/api";

function renderProtected(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/admin/login" element={<div>Login Page</div>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <div>Painel secreto</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <div>Somente admin</div>
          </ProtectedRoute>
        }
      />
    </Routes>,
    { route },
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("redirects unauthenticated users to the admin login page", async () => {
    renderProtected("/admin");

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  it("renders the protected content for an authenticated user", async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "fake-token");
    server.use(
      http.get(`${API_BASE}/auth/me`, () =>
        HttpResponse.json({ id: 1, name: "Admin", email: "admin@test.dev", role: "ADMIN", active: true, createdAt: "2024-01-01T00:00:00Z" }),
      ),
    );

    renderProtected("/admin");

    await waitFor(() => {
      expect(screen.getByText("Painel secreto")).toBeInTheDocument();
    });
  });

  it("redirects a VENDEDOR away from an ADMIN-only route", async () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "fake-token");
    server.use(
      http.get(`${API_BASE}/auth/me`, () =>
        HttpResponse.json({ id: 2, name: "Vendedor", email: "vendedor@test.dev", role: "VENDEDOR", active: true, createdAt: "2024-01-01T00:00:00Z" }),
      ),
    );

    renderProtected("/admin/usuarios");

    await waitFor(() => {
      expect(screen.getByText("Painel secreto")).toBeInTheDocument();
    });
    expect(screen.queryByText("Somente admin")).not.toBeInTheDocument();
  });
});
