export type UserRole = "ADMIN" | "VENDEDOR";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  brandId: number | null;
  brandName: string | null;
  createdAt: string;
}

export interface UserCreateValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  brandId?: number | null;
}

export interface UserUpdateValues {
  name: string;
  email: string;
  role: UserRole;
  brandId?: number | null;
  password?: string;
}
