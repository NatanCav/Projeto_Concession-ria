import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Car, Menu, Search, X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/utils/cn";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors hover:text-brand-500",
    isActive ? "text-brand-500" : "text-ink-600",
  );

export function Header() {
  const { data: settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(searchTerm ? `/veiculos?q=${encodeURIComponent(searchTerm)}` : "/veiculos");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-ink-900" onClick={() => setMenuOpen(false)}>
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.dealershipName} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Car className="h-5 w-5" />
            </span>
          )}
          <span className="hidden sm:inline">{settings?.dealershipName ?? "Concessionária"}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Início
          </NavLink>
          <NavLink to="/veiculos" className={navLinkClass}>
            Catálogo
          </NavLink>
        </nav>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-sm items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Marca, modelo ou versão"
              className="h-10 w-full rounded-full border border-ink-200 bg-ink-50 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Marca, modelo ou versão"
                className="h-10 w-full rounded-full border border-ink-200 bg-ink-50 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-3">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Início
            </NavLink>
            <NavLink to="/veiculos" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Catálogo
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
