import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useUserMutations, useUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { extractErrorMessage } from "@/services/apiClient";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { User } from "@/types/user";

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(150),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  role: z.enum(["ADMIN", "VENDEDOR"]),
  password: z.string().optional(),
});

type UserFormSchema = z.infer<typeof userSchema>;

export function AdminUsers() {
  useDocumentMeta({ title: "Usuários — Painel administrativo" });

  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { create, update, changeStatus, remove } = useUserMutations();

  const [editing, setEditing] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormSchema>({ resolver: zodResolver(userSchema), defaultValues: { name: "", email: "", role: "VENDEDOR", password: "" } });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", email: "", role: "VENDEDOR", password: "" });
    setIsFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    reset({ name: user.name, email: user.email, role: user.role, password: "" });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: UserFormSchema) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, values: { ...values, password: values.password || undefined } });
        toast.success("Usuário atualizado.");
      } else {
        if (!values.password) {
          toast.error("Senha é obrigatória para novos usuários.");
          return;
        }
        await create.mutateAsync({ ...values, password: values.password });
        toast.success("Usuário cadastrado.");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível salvar o usuário."));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await changeStatus.mutateAsync({ id: user.id, active: !user.active });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível atualizar o status."));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success("Usuário excluído.");
      setToDelete(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Não foi possível excluir o usuário."));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Usuários</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
        {!isLoading && users?.length === 0 ? (
          <div className="p-10">
            <EmptyState title="Nenhum usuário cadastrado" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{user.name}</td>
                  <td className="px-4 py-3 text-ink-600">{user.email}</td>
                  <td className="px-4 py-3">{user.role === "ADMIN" ? "Administrador" : "Vendedor"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(user)}
                      disabled={user.id === currentUser?.id}
                      className={`text-sm font-medium ${user.active ? "text-emerald-600" : "text-ink-400"} disabled:cursor-not-allowed`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(user)}
                        disabled={user.id === currentUser?.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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

      <Modal open={isFormOpen} onOpenChange={setIsFormOpen} title={editing ? "Editar usuário" : "Novo usuário"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Nome" error={errors.name?.message} {...register("name")} />
          <Input label="E-mail" type="email" error={errors.email?.message} {...register("email")} />
          <Select label="Perfil" error={errors.role?.message} {...register("role")}>
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Administrador</option>
          </Select>
          <Input
            label="Senha"
            type="password"
            hint={editing ? "Deixe em branco para manter a senha atual" : undefined}
            error={errors.password?.message}
            {...register("password")}
          />
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
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir "${toDelete?.name}"?`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
