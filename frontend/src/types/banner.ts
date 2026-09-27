export interface Banner {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  active: boolean;
}

export interface BannerFormValues {
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  active: boolean;
}
