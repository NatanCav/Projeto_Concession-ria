import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import type { UserCreateValues, UserUpdateValues } from "@/types/user";

export function useUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => userService.list(),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const create = useMutation({
    mutationFn: (values: UserCreateValues) => userService.create(values),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UserUpdateValues }) => userService.update(id, values),
    onSuccess: invalidate,
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => userService.changeStatus(id, active),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, changeStatus, remove };
}
