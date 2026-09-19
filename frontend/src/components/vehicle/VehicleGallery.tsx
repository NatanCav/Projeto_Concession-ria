import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { VehicleImage } from "@/types/vehicle";
import { cn } from "@/utils/cn";

interface VehicleGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export function VehicleGallery({ images, vehicleName }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-ink-100 text-ink-400">
        Sem fotos disponíveis
      </div>
    );
  }

  const goTo = (index: number) => setActiveIndex((index + images.length) % images.length);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-ink-100">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block aspect-[4/3] w-full"
          aria-label="Ampliar imagem"
        >
          <img
            src={images[activeIndex].imageUrl}
            alt={`${vehicleName} - foto ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
        </button>

        <div className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white">
          <Expand className="h-4 w-4" />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink-700 hover:bg-white"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink-700 hover:bg-white"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-brand-500" : "border-transparent",
              )}
            >
              <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">{`Foto ampliada de ${vehicleName}`}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <img
              src={images[activeIndex].imageUrl}
              alt={`${vehicleName} - foto ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
