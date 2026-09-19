import { apiClient } from "./apiClient";
import type { User, UserCreateValues, UserUpdateValues } from "@/types/user";

export const userService = {
  async list(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>("/users");
    return data;
  },

  async create(values: UserCreateValues): Promise<User> {
    const { data } = await apiClient.post<User>("/users", values);
    return data;
  },

  async update(id: number, values: UserUpdateValues): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${id}`, values);
    return data;
  },

  async changeStatus(id: number, active: boolean): Promise<User> {
    const { data } = await apiClient.patch<User>(`/users/${id}/status`, { active });
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
