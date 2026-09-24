import { lazy, Suspense, type ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Home } from "@/pages/Home";

const Catalog = lazy(() => import("@/pages/Catalog").then((m) => ({ default: m.Catalog })));
const VehicleDetailPage = lazy(() =>
  import("@/pages/VehicleDetailPage").then((m) => ({ default: m.VehicleDetailPage })),
);
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })));

const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const AdminVehicleList = lazy(() =>
  import("@/pages/admin/AdminVehicleList").then((m) => ({ default: m.AdminVehicleList })),
);
const AdminVehicleForm = lazy(() =>
  import("@/pages/admin/AdminVehicleForm").then((m) => ({ default: m.AdminVehicleForm })),
);
const AdminBrands = lazy(() => import("@/pages/admin/AdminBrands").then((m) => ({ default: m.AdminBrands })));
const AdminCategories = lazy(() =>
  import("@/pages/admin/AdminCategories").then((m) => ({ default: m.AdminCategories })),
);
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminSettings = lazy(() =>
  import("@/pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })),
);

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

function withSuspense(element: ReactElement) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/veiculos" element={withSuspense(<Catalog />)} />
        <Route path="/veiculos/:slug" element={withSuspense(<VehicleDetailPage />)} />
      </Route>

      <Route path="/admin/login" element={withSuspense(<AdminLogin />)} />

      <Route
        path="/admin"
        element={<ProtectedRoute>{withSuspense(<AdminLayout />)}</ProtectedRoute>}
      >
        <Route index element={withSuspense(<AdminDashboard />)} />
        <Route path="veiculos" element={withSuspense(<AdminVehicleList />)} />
        <Route path="veiculos/novo" element={withSuspense(<AdminVehicleForm />)} />
        <Route path="veiculos/:id/editar" element={withSuspense(<AdminVehicleForm />)} />
        <Route path="marcas" element={withSuspense(<AdminBrands />)} />
        <Route path="categorias" element={withSuspense(<AdminCategories />)} />
        <Route
          path="usuarios"
          element={<ProtectedRoute roles={["ADMIN"]}>{withSuspense(<AdminUsers />)}</ProtectedRoute>}
        />
        <Route path="configuracoes" element={withSuspense(<AdminSettings />)} />
      </Route>

      <Route path="*" element={withSuspense(<NotFound />)} />
    </Routes>
  );
}
