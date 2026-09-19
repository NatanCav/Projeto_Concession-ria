import { MessageCircle } from "lucide-react";
import { useRegisterLead } from "@/hooks/useLead";
import { buildWhatsappUrl } from "@/utils/whatsapp";
import type { VehicleDetail } from "@/types/vehicle";

interface WhatsAppInterestButtonProps {
  vehicle: VehicleDetail;
  whatsapp: string;
  className?: string;
}

export function WhatsAppInterestButton({ vehicle, whatsapp, className }: WhatsAppInterestButtonProps) {
  const registerLead = useRegisterLead();

  const handleClick = () => {
    registerLead.mutate(vehicle.id);
  };

  const url = buildWhatsappUrl(whatsapp, {
    brandName: vehicle.brand.name,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    url: window.location.href,
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={
        className ??
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 text-base font-bold text-white transition-colors hover:bg-emerald-600 sm:w-auto"
      }
    >
      <MessageCircle className="h-5 w-5" />
      Tenho interesse
    </a>
  );
}
