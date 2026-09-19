export interface Category {
  id: number;
  name: string;
  active: boolean;
}

export interface CategoryFormValues {
  name: string;
  active?: boolean;
}
