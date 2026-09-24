import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Car, Menu, MessageCircle, Search, X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { buildGenericWhatsappUrl } from "@/utils/whatsapp";
import { cn } from "@/utils/cn";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors hover:text-brand-500",
    isActive ? "text-brand-500" : "text-ink-600",
  );

interface HeaderSearchFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  className?: string;
}

function HeaderSearchForm({ value, onChange, onSubmit, className }: HeaderSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Marca, modelo ou versão"
          aria-label="Buscar veículos"
          className="h-10 w-full rounded-full border border-ink-200 bg-ink-50 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
    </form>
  );
}

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
      <div className="container-page flex h-16 items-center justify-between gap-4">
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

        <HeaderSearchForm
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={handleSearch}
          className="hidden max-w-sm flex-1 items-center md:flex"
        />

        {settings?.whatsapp && (
          <a
            href={buildGenericWhatsappUrl(settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-800 md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        )}

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 md:hidden">
          <HeaderSearchForm value={searchTerm} onChange={setSearchTerm} onSubmit={handleSearch} className="mb-4" />
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
