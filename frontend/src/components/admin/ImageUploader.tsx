import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from "lucide-react";
import { useVehicleImageMutations } from "@/hooks/useVehicleImages";
import { extractErrorMessage } from "@/services/apiClient";
import { cn } from "@/utils/cn";
import type { VehicleImage } from "@/types/vehicle";

interface ImageUploaderProps {
  vehicleId: number;
  images: VehicleImage[];
}

export function ImageUploader({ vehicleId, images }: ImageUploaderProps) {
  const { upload, reorder, setPrimary, remove } = useVehicleImageMutations(vehicleId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      await upload.mutateAsync(Array.from(files));
      toast.success("Fotos enviadas com sucesso.");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível enviar as fotos."));
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const newOrder = [...sorted];
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    try {
      await reorder.mutateAsync(newOrder.map((image) => image.id));
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível reordenar as fotos."));
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await setPrimary.mutateAsync(imageId);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível definir a foto principal."));
    }
  };

  const handleRemove = async (imageId: number) => {
    try {
      await remove.mutateAsync(imageId);
      toast.success("Foto removida.");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível remover a foto."));
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-brand-300",
        )}
      >
        <Upload className="h-8 w-8 text-ink-400" />
        <p className="text-sm font-medium text-ink-700">Arraste fotos aqui ou clique para selecionar</p>
        <p className="text-xs text-ink-400">JPG, PNG ou WEBP</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {upload.isPending && <p className="mt-2 text-sm text-ink-500">Enviando fotos...</p>}

      {sorted.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sorted.map((image, index) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border border-ink-100">
              <img src={image.imageUrl} alt="" className="aspect-square w-full object-cover" />
              {image.primary && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  Principal
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                  aria-label="Mover para a esquerda"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image.id)}
                  disabled={image.primary}
                  className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                  aria-label="Definir como principal"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="rounded p-1 text-white hover:bg-white/20"
                  aria-label="Remover foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sorted.length - 1}
                  className="rounded p-1 text-white hover:bg-white/20 disabled:opacity-30"
                  aria-label="Mover para a direita"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
