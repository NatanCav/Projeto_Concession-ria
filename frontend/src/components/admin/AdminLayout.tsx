import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Car,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/veiculos", label: "Veículos", icon: Car },
  { to: "/admin/marcas", label: "Marcas", icon: Tags },
  { to: "/admin/categorias", label: "Categorias", icon: ListTree },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const visibleItems = navItems.filter((item) => !item.adminOnly || hasRole("ADMIN"));

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
          <Car className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold">Painel Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-brand-500 text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-800 px-5 py-4">
        <p className="text-sm font-semibold text-white">{user?.name}</p>
        <p className="text-xs text-ink-400">{user?.role === "ADMIN" ? "Administrador" : "Vendedor"}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-300 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-64 flex-col bg-ink-950 md:flex">{sidebarContent}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex w-64 flex-col bg-ink-950">{sidebarContent}</div>
          <button
            type="button"
            className="flex-1 bg-black/50"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 md:px-6">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Abrir menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="text-sm font-medium text-ink-500 hover:text-brand-500">
            Ver site público →
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
