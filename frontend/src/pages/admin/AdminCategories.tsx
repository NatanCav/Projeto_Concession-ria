import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryMutations } from "@/hooks/useAdminCategories";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { extractErrorMessage } from "@/services/apiClient";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { Category } from "@/types/category";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  active: z.boolean(),
});

type CategoryFormSchema = z.infer<typeof categorySchema>;

export function AdminCategories() {
  useDocumentMeta({ title: "Categorias — Painel administrativo" });

  const { data: categories, isLoading } = useCategories(true);
  const { create, update, remove } = useCategoryMutations();

  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormSchema>({ resolver: zodResolver(categorySchema), defaultValues: { name: "", active: true } });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", active: true });
    setIsFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    reset({ name: category.name, active: category.active });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: CategoryFormSchema) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, values });
        toast.success("Categoria atualizada.");
      } else {
        await create.mutateAsync(values);
        toast.success("Categoria cadastrada.");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível salvar a categoria."));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Categoria excluída.");
      setToDelete(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível excluir a categoria."));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Categorias</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {!isLoading && categories?.length === 0 ? (
          <div className="p-10">
            <EmptyState title="Nenhuma categoria cadastrada" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{category.name}</td>
                  <td className="px-4 py-3">
                    <span className={category.active ? "text-emerald-600" : "text-ink-400"}>
                      {category.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={isFormOpen} onOpenChange={setIsFormOpen} title={editing ? "Editar categoria" : "Nova categoria"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" error={errors.name?.message} {...register("name")} />
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300" {...register("active")} />
            Categoria ativa
          </label>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${toDelete?.name}"?`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
