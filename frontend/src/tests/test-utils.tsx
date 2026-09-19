import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderOptions {
  route?: string;
}

export function renderWithProviders(ui: ReactElement, { route = "/" }: RenderOptions = {}) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

export * from "@testing-library/react";
