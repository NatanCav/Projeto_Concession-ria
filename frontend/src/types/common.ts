export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: { field: string; message: string }[] | null;
}
