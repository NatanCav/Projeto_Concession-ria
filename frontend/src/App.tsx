import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Home } from "@/pages/Home";
import { Catalog } from "@/pages/Catalog";
import { VehicleDetailPage } from "@/pages/VehicleDetailPage";
import { NotFound } from "@/pages/NotFound";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminVehicleList } from "@/pages/admin/AdminVehicleList";
import { AdminVehicleForm } from "@/pages/admin/AdminVehicleForm";
import { AdminBrands } from "@/pages/admin/AdminBrands";
import { AdminCategories } from "@/pages/admin/AdminCategories";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminSettings } from "@/pages/admin/AdminSettings";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/veiculos" element={<Catalog />} />
        <Route path="/veiculos/:slug" element={<VehicleDetailPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="veiculos" element={<AdminVehicleList />} />
        <Route path="veiculos/novo" element={<AdminVehicleForm />} />
        <Route path="veiculos/:id/editar" element={<AdminVehicleForm />} />
        <Route path="marcas" element={<AdminBrands />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path="configuracoes" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
