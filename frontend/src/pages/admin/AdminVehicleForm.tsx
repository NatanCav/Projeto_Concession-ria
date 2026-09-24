import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAdminVehicle, useCreateVehicle, useUpdateVehicle } from "@/hooks/useAdminVehicles";
import { useBrands } from "@/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { extractErrorMessage } from "@/services/apiClient";
import { fuelLabels, statusLabels, transmissionLabels, vehicleTypeLabels } from "@/utils/labels";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useSubmitGuard } from "@/hooks/useSubmitGuard";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().optional(),
);

const specificationSchema = z.object({
  engine: z.string().optional(),
  displacement: z.string().optional(),
  horsepower: z.string().optional(),
  torque: z.string().optional(),
  traction: z.string().optional(),
  urbanConsumption: optionalNumber,
  highwayConsumption: optionalNumber,
  fuelTankCapacity: optionalNumber,
  doors: optionalNumber,
  seats: optionalNumber,
  weight: optionalNumber,
  length: optionalNumber,
  width: optionalNumber,
  height: optionalNumber,
});

const vehicleSchema = z.object({
  brandId: z.coerce.number().positive("Selecione uma marca"),
  categoryId: z.coerce.number().positive("Selecione uma categoria"),
  vehicleType: z.enum(["CARRO", "MOTO", "CAMINHAO"]),
  model: z.string().min(1, "Modelo é obrigatório").max(100),
  version: z.string().min(1, "Versão é obrigatória").max(150),
  year: z.coerce.number().min(1950, "Ano inválido").max(2100, "Ano inválido"),
  mileage: z.coerce.number().min(0, "Quilometragem não pode ser negativa"),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  promotionalPrice: optionalNumber,
  fuel: z.enum(["FLEX", "GASOLINA", "ETANOL", "DIESEL", "HIBRIDO", "ELETRICO", "GNV"]),
  transmission: z.enum(["MANUAL", "AUTOMATICO", "AUTOMATIZADO", "CVT", "SEMI_AUTOMATICO"]),
  color: z.string().optional(),
  licensePlateLastDigits: z.string().max(4, "Informe só os últimos dígitos").optional(),
  description: z.string().optional(),
  status: z.enum(["DISPONIVEL", "RESERVADO", "VENDIDO", "INATIVO"]),
  featured: z.boolean(),
  specifications: specificationSchema,
});

type VehicleFormSchema = z.infer<typeof vehicleSchema>;

const defaultValues: VehicleFormSchema = {
  brandId: 0,
  categoryId: 0,
  vehicleType: "CARRO",
  model: "",
  version: "",
  year: new Date().getFullYear(),
  mileage: 0,
  price: 0,
  promotionalPrice: undefined,
  fuel: "FLEX",
  transmission: "MANUAL",
  color: "",
  licensePlateLastDigits: "",
  description: "",
  status: "DISPONIVEL",
  featured: false,
  specifications: {},
};

export function AdminVehicleForm() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = id ? Number(id) : undefined;
  const isEditing = !!vehicleId;
  const navigate = useNavigate();

  useDocumentMeta({ title: isEditing ? "Editar veículo — Painel administrativo" : "Novo veículo — Painel administrativo" });

  const { data: brands } = useBrands(true);
  const { data: categories } = useCategories(true);
  const { data: vehicle, isLoading: isLoadingVehicle } = useAdminVehicle(vehicleId);
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle(vehicleId ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormSchema>({ resolver: zodResolver(vehicleSchema), defaultValues });

  useEffect(() => {
    if (vehicle) {
      reset({
        brandId: vehicle.brand.id,
        categoryId: vehicle.category.id,
        vehicleType: vehicle.vehicleType,
        model: vehicle.model,
        version: vehicle.version,
        year: vehicle.year,
        mileage: vehicle.mileage,
        price: vehicle.price,
        promotionalPrice: vehicle.promotionalPrice ?? undefined,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        color: vehicle.color ?? "",
        licensePlateLastDigits: vehicle.licensePlateLastDigits ?? "",
        description: vehicle.description ?? "",
        status: vehicle.status,
        featured: vehicle.featured,
        specifications: {
          engine: vehicle.specifications?.engine ?? "",
          displacement: vehicle.specifications?.displacement ?? "",
          horsepower: vehicle.specifications?.horsepower ?? "",
          torque: vehicle.specifications?.torque ?? "",
          traction: vehicle.specifications?.traction ?? "",
          urbanConsumption: vehicle.specifications?.urbanConsumption ?? undefined,
          highwayConsumption: vehicle.specifications?.highwayConsumption ?? undefined,
          fuelTankCapacity: vehicle.specifications?.fuelTankCapacity ?? undefined,
          doors: vehicle.specifications?.doors ?? undefined,
          seats: vehicle.specifications?.seats ?? undefined,
          weight: vehicle.specifications?.weight ?? undefined,
          length: vehicle.specifications?.length ?? undefined,
          width: vehicle.specifications?.width ?? undefined,
          height: vehicle.specifications?.height ?? undefined,
        },
      });
    }
  }, [vehicle, reset]);

  const onSubmit = useSubmitGuard(async (values: VehicleFormSchema) => {
    try {
      if (isEditing) {
        await updateVehicle.mutateAsync(values);
        toast.success("Veículo atualizado com sucesso.");
      } else {
        const created = await createVehicle.mutateAsync(values);
        toast.success("Veículo cadastrado com sucesso. Agora adicione as fotos.");
        navigate(`/admin/veiculos/${created.id}/editar`);
        return;
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível salvar o veículo."));
    }
  });

  if (isEditing && isLoadingVehicle) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="flex flex-col gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">{isEditing ? "Editar veículo" : "Novo veículo"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <section className="rounded-xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-ink-900">Informações principais</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Marca" error={errors.brandId?.message} {...register("brandId")}>
              <option value={0}>Selecione</option>
              {brands?.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
            <Select label="Categoria" error={errors.categoryId?.message} {...register("categoryId")}>
              <option value={0}>Selecione</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select label="Tipo de veículo" error={errors.vehicleType?.message} {...register("vehicleType")}>
              {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select label="Status" error={errors.status?.message} {...register("status")}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input label="Modelo" error={errors.model?.message} {...register("model")} />
            <Input label="Versão" error={errors.version?.message} {...register("version")} />
            <Input label="Ano" type="number" error={errors.year?.message} {...register("year")} />
            <Input label="Quilometragem" type="number" error={errors.mileage?.message} {...register("mileage")} />
            <Input label="Preço" type="number" step="0.01" error={errors.price?.message} {...register("price")} />
            <Input
              label="Preço promocional"
              type="number"
              step="0.01"
              hint="Opcional"
              error={errors.promotionalPrice?.message}
              {...register("promotionalPrice")}
            />
            <Select label="Combustível" error={errors.fuel?.message} {...register("fuel")}>
              {Object.entries(fuelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select label="Câmbio" error={errors.transmission?.message} {...register("transmission")}>
              {Object.entries(transmissionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input label="Cor" {...register("color")} />
            <Input label="Final da placa" hint="Opcional" {...register("licensePlateLastDigits")} />
          </div>
          <div className="mt-4">
            <Textarea label="Descrição" rows={4} {...register("description")} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300" {...register("featured")} />
            Destacar este veículo na home
          </label>
        </section>

        <section className="rounded-xl border border-ink-100 bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-ink-900">Ficha técnica</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Motor" {...register("specifications.engine")} />
            <Input label="Cilindrada" {...register("specifications.displacement")} />
            <Input label="Potência" {...register("specifications.horsepower")} />
            <Input label="Torque" {...register("specifications.torque")} />
            <Input label="Tração" {...register("specifications.traction")} />
            <Input label="Consumo urbano (km/l)" type="number" step="0.1" {...register("specifications.urbanConsumption")} />
            <Input label="Consumo rodoviário (km/l)" type="number" step="0.1" {...register("specifications.highwayConsumption")} />
            <Input label="Capacidade do tanque (L)" type="number" step="0.1" {...register("specifications.fuelTankCapacity")} />
            <Input label="Portas" type="number" {...register("specifications.doors")} />
            <Input label="Lugares" type="number" {...register("specifications.seats")} />
            <Input label="Peso (kg)" type="number" step="0.1" {...register("specifications.weight")} />
            <Input label="Comprimento (mm)" type="number" step="0.1" {...register("specifications.length")} />
            <Input label="Largura (mm)" type="number" step="0.1" {...register("specifications.width")} />
            <Input label="Altura (mm)" type="number" step="0.1" {...register("specifications.height")} />
          </div>
        </section>

        {isEditing && vehicle ? (
          <section className="rounded-xl border border-ink-100 bg-white p-6">
            <h2 className="mb-4 text-base font-bold text-ink-900">Fotos</h2>
            <ImageUploader vehicleId={vehicle.id} images={vehicle.images} />
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-6 text-center">
            <h2 className="text-base font-bold text-ink-900">Fotos</h2>
            <p className="mt-1 text-sm text-ink-500">
              Salve o cadastro para liberar o envio de fotos deste veículo.
            </p>
          </section>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/veiculos")}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Salvar alterações" : "Cadastrar veículo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
