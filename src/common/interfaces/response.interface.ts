export interface Status {
  code: number;
  message: string | null;
  errorCode?: string | null;
}

export interface ApiResponse<T> {
  status: Status;
  data: T;
}
