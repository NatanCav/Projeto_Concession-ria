import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { extractErrorMessage } from "@/services/apiClient";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const settingsSchema = z.object({
  dealershipName: z.string().min(1, "Nome é obrigatório").max(150),
  logoUrl: z.string().optional(),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório").max(20),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2, "Use a sigla do estado (ex.: SP)").optional(),
  openingHours: z.string().optional(),
  description: z.string().optional(),
});

type SettingsFormSchema = z.infer<typeof settingsSchema>;

export function AdminSettings() {
  useDocumentMeta({ title: "Configurações — Painel administrativo" });

  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormSchema>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (settings) {
      reset({
        dealershipName: settings.dealershipName,
        logoUrl: settings.logoUrl ?? "",
        whatsapp: settings.whatsapp,
        phone: settings.phone ?? "",
        instagram: settings.instagram ?? "",
        address: settings.address ?? "",
        city: settings.city ?? "",
        state: settings.state ?? "",
        openingHours: settings.openingHours ?? "",
        description: settings.description ?? "",
      });
    }
  }, [settings, reset]);

  const onSubmit = async (values: SettingsFormSchema) => {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Configurações salvas com sucesso.");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível salvar as configurações."));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-6 h-8 w-72" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Configurações da concessionária</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 rounded-xl border border-ink-100 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nome da concessionária" error={errors.dealershipName?.message} {...register("dealershipName")} />
          <Input label="URL do logo" hint="Opcional" {...register("logoUrl")} />
          <Input
            label="WhatsApp"
            hint="Com DDI e DDD, ex.: 5511999999999"
            error={errors.whatsapp?.message}
            {...register("whatsapp")}
          />
          <Input label="Telefone" {...register("phone")} />
          <Input label="Instagram" {...register("instagram")} />
          <Input label="Horário de funcionamento" {...register("openingHours")} />
          <Input label="Endereço" {...register("address")} />
          <Input label="Cidade" {...register("city")} />
          <Input label="Estado (UF)" maxLength={2} error={errors.state?.message} {...register("state")} />
        </div>
        <Textarea label="Descrição" rows={4} {...register("description")} />

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            Salvar configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
