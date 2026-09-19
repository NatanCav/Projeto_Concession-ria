import { Link } from "react-router-dom";
import { Instagram, MapPin, Phone } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export function Footer() {
  const { data: settings } = useSettings();

  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-200">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-lg font-bold text-white">{settings?.dealershipName ?? "Concessionária"}</h3>
          <p className="mt-2 text-sm text-ink-400">
            {settings?.description ?? "Encontre o veículo ideal para você com procedência e confiança."}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Navegação</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white">
                Início
              </Link>
            </li>
            <li>
              <Link to="/veiculos" className="hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-white">
                Área administrativa
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Contato</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {settings?.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                <span>
                  {settings.address}
                  {settings.city ? `, ${settings.city}` : ""}
                  {settings.state ? `/${settings.state}` : ""}
                </span>
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-ink-500" />
                <span>{settings.phone}</span>
              </li>
            )}
            {settings?.instagram && (
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 shrink-0 text-ink-500" />
                <span>{settings.instagram}</span>
              </li>
            )}
            {settings?.openingHours && <li className="text-ink-400">{settings.openingHours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-900 py-4 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} {settings?.dealershipName ?? "Concessionária"}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
