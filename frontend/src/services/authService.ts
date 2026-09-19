import { apiClient } from "./apiClient";
import type { User } from "@/types/user";

export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export const authService = {
  async login(values: LoginValues): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", values);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
