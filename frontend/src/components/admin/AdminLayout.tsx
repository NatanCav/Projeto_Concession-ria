import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  adminOnly?: boolean;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Principal",
    items: [{ to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Estoque",
    items: [
      { to: "/admin/veiculos", label: "Veículos", icon: Car },
      { to: "/admin/marcas", label: "Marcas", icon: Tags, adminOnly: true },
      { to: "/admin/categorias", label: "Categorias", icon: ListTree, adminOnly: true },
    ],
  },
  {
    label: "Atendimento",
    items: [{ to: "/admin/leads", label: "Interesses", icon: MessageCircle }],
  },
  {
    label: "Sistema",
    items: [
      { to: "/admin/usuarios", label: "Usuários", icon: Users, adminOnly: true },
      { to: "/admin/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
    ],
  },
];

const pageTitles: { test: (path: string) => boolean; title: string }[] = [
  { test: (p) => p === "/admin", title: "Visão geral" },
  { test: (p) => p === "/admin/veiculos", title: "Veículos" },
  { test: (p) => p === "/admin/veiculos/novo", title: "Novo veículo" },
  { test: (p) => /^\/admin\/veiculos\/\d+\/editar$/.test(p), title: "Editar veículo" },
  { test: (p) => p === "/admin/leads", title: "Interesses" },
  { test: (p) => p === "/admin/marcas", title: "Marcas" },
  { test: (p) => p === "/admin/categorias", title: "Categorias" },
  { test: (p) => p === "/admin/usuarios", title: "Usuários" },
  { test: (p) => p === "/admin/configuracoes", title: "Configurações" },
];

function getPageTitle(pathname: string): string {
  return pageTitles.find((entry) => entry.test(pathname))?.title ?? "Painel administrativo";
}

export function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.adminOnly || hasRole("ADMIN")) }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
          <Car className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold">Painel Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-5 px-3">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
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
            </div>
          </div>
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
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <aside className="hidden w-64 flex-col bg-ink-950 md:flex">{sidebarContent}</aside>

      <Sheet
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        title="Menu do painel"
        hideHeader
        className="bg-ink-950 md:hidden"
      >
        {sidebarContent}
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-ink-100 bg-white px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <p className="truncate text-sm font-semibold text-ink-900 md:text-base">
              {getPageTitle(location.pathname)}
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 text-sm font-medium text-ink-500 hover:text-brand-500"
          >
            Ver site público →
          </Link>
        </header>
        <main id="admin-main-content" className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
