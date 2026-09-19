export type UserRole = "ADMIN" | "VENDEDOR";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface UserCreateValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateValues {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}
