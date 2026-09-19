export interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  active: boolean;
}

export interface BrandFormValues {
  name: string;
  logoUrl?: string;
  active?: boolean;
}
