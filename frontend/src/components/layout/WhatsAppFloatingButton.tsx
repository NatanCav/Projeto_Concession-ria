import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { buildGenericWhatsappUrl } from "@/utils/whatsapp";

export function WhatsAppFloatingButton() {
  const { data: settings } = useSettings();
  const { pathname } = useLocation();

  // A página de detalhes do veículo já tem seu próprio CTA de WhatsApp contextual
  // (inline no desktop, fixo no rodapé no mobile) — evita duplicar o botão flutuante ali.
  const isVehicleDetailPage = /^\/veiculos\/[^/]+$/.test(pathname);

  if (!settings?.whatsapp || isVehicleDetailPage) {
    return null;
  }

  return (
    <a
      href={buildGenericWhatsappUrl(settings.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-popover transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
