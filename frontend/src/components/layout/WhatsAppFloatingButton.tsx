import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { buildGenericWhatsappUrl } from "@/utils/whatsapp";

export function WhatsAppFloatingButton() {
  const { data: settings } = useSettings();

  if (!settings?.whatsapp) {
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
