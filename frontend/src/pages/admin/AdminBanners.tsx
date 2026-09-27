import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, GalleryHorizontal, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminBanners, useBannerMutations } from "@/hooks/useBanners";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { extractErrorMessage } from "@/services/apiClient";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";
import { cn } from "@/utils/cn";
import type { Banner } from "@/types/banner";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const bannerSchema = z.object({
  title: z.string().max(120, "Máximo de 120 caracteres").optional(),
  subtitle: z.string().max(255, "Máximo de 255 caracteres").optional(),
  linkUrl: z
    .string()
    .max(500)
    .optional()
    .refine(
      (value) => !value || (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//.test(value),
      'Use um caminho do site (ex.: /veiculos?vehicleType=MOTO) ou um endereço começando com "https://"',
    ),
  active: z.boolean(),
});

type BannerFormSchema = z.infer<typeof bannerSchema>;

function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return `"${file.name}" não é uma imagem JPG, PNG ou WEBP.`;
  if (file.size > MAX_IMAGE_BYTES) return "A imagem deve ter no máximo 10 MB.";
  return null;
}

export function AdminBanners() {
  useDocumentMeta({ title: "Banners da home — Painel administrativo" });

  const { data: banners, isLoading } = useAdminBanners();
  const { create, update, replaceImage, reorder, remove } = useBannerMutations();

  const [editing, setEditing] = useState<Banner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Banner | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormSchema>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: "", subtitle: "", linkUrl: "", active: true },
  });

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    reset({ title: "", subtitle: "", linkUrl: "", active: true });
    setIsFormOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setFile(null);
    reset({
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      linkUrl: banner.linkUrl ?? "",
      active: banner.active,
    });
    setIsFormOpen(true);
  };

  const handleFileChange = (selected: File | undefined) => {
    if (!selected) return;
    const error = validateImage(selected);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(selected);
  };

  const onSubmit = useSubmitGuard(async (values: BannerFormSchema) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, values });
        if (file) await replaceImage.mutateAsync({ id: editing.id, file });
        toast.success("Banner atualizado.");
      } else {
        if (!file) {
          toast.error("Escolha a imagem do banner.");
          return;
        }
        await create.mutateAsync({ file, values });
        toast.success("Banner publicado na home.");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível salvar o banner."));
    }
  });

  const move = async (index: number, direction: -1 | 1) => {
    if (!banners) return;
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const ids = banners.map((banner) => banner.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorder.mutateAsync(ids);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível reordenar os banners."));
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await update.mutateAsync({
        id: banner.id,
        values: {
          title: banner.title ?? "",
          subtitle: banner.subtitle ?? "",
          linkUrl: banner.linkUrl ?? "",
          active: !banner.active,
        },
      });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível alterar o banner."));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Banner excluído.");
      setToDelete(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível excluir o banner."));
    }
  };

  const activeCount = banners?.filter((banner) => banner.active).length ?? 0;
  const modalImage = previewUrl ?? editing?.imageUrl ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Banners da home</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Imagens exibidas no topo da página inicial, em sequência automática. A ordem aqui é a ordem no site.
            {activeCount === 0 && !isLoading && " Sem banners ativos, a home usa a foto de um veículo em destaque."}
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Novo banner
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !banners || banners.length === 0 ? (
        <div className="rounded-xl border border-ink-100 bg-white p-10">
          <EmptyState
            icon={GalleryHorizontal}
            title="Nenhum banner cadastrado"
            description="Envie uma imagem larga (recomendado 1920 × 800 px) para destacar promoções ou lojas na home."
          />
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {banners.map((banner, index) => (
            <li
              key={banner.id}
              className={cn(
                "flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center",
                banner.active ? "border-ink-100" : "border-dashed border-ink-200 bg-ink-50/60",
              )}
            >
              <div className="relative aspect-[12/5] w-full shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:w-56">
                <img
                  src={banner.imageUrl}
                  alt=""
                  className={cn("h-full w-full object-cover", !banner.active && "opacity-50")}
                  loading="lazy"
                />
                <span className="absolute left-2 top-2 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {index + 1}º
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-ink-900">{banner.title || "Sem título"}</p>
                  <Badge className={banner.active ? "bg-emerald-100 text-emerald-700" : "bg-ink-200 text-ink-500"}>
                    {banner.active ? "No ar" : "Oculto"}
                  </Badge>
                </div>
                {banner.subtitle && <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{banner.subtitle}</p>}
                <p className="mt-1 truncate text-xs text-ink-400">
                  {banner.linkUrl ? `Link: ${banner.linkUrl}` : "Sem link"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Mover para cima" onClick={() => move(index, -1)} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Mover para baixo"
                  onClick={() => move(index, 1)}
                  disabled={index === banners.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <button
                  type="button"
                  onClick={() => toggleActive(banner)}
                  className="mx-1 h-8 rounded-lg border border-ink-200 px-3 text-xs font-semibold text-ink-700 hover:bg-ink-100"
                >
                  {banner.active ? "Ocultar" : "Publicar"}
                </button>
                <IconButton label="Editar" onClick={() => openEdit(banner)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton label="Excluir" onClick={() => setToDelete(banner)} danger>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? "Editar banner" : "Novo banner"}
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-popover focus:outline-none"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-ink-700">Imagem</p>
            <label
              className={cn(
                "relative flex aspect-[12/5] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed text-center",
                modalImage ? "border-transparent" : "border-ink-200 bg-ink-50 hover:border-brand-500",
              )}
            >
              {modalImage ? (
                <>
                  <img src={modalImage} alt="Pré-visualização do banner" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-ink-950/80 px-2.5 py-1.5 text-xs font-semibold text-white">
                    <ImagePlus className="h-3.5 w-3.5" /> Trocar imagem
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-1 px-4 text-sm text-ink-500">
                  <ImagePlus className="h-6 w-6 text-ink-400" />
                  Clique para escolher a imagem
                  <span className="text-xs text-ink-400">JPG, PNG ou WEBP · até 10 MB · ideal 1920 × 800 px</span>
                </span>
              )}
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className="sr-only"
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          <Input
            label="Título"
            hint="Opcional — aparece em destaque sobre a imagem"
            maxLength={120}
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            label="Subtítulo"
            hint="Opcional"
            maxLength={255}
            error={errors.subtitle?.message}
            {...register("subtitle")}
          />
          <Input
            label="Link do botão"
            placeholder="/lojas/1 ou https://..."
            hint="Opcional — para onde o visitante vai ao clicar em “Ver ofertas”"
            error={errors.linkUrl?.message}
            {...register("linkUrl")}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300" {...register("active")} />
            Exibir na home
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editing ? "Salvar" : "Publicar banner"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir banner"
        description={`Tem certeza que deseja excluir o banner "${toDelete?.title || "sem título"}"? A imagem também será apagada.`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-30",
        danger ? "text-red-500 hover:bg-red-50" : "text-ink-500 hover:bg-ink-100",
      )}
    >
      {children}
    </button>
  );
}
