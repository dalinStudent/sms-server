import type { Response } from "@/common/types/response.type";

export const success = <T>(
  data: T,
  message: string | null = null
): Response<T> => ({
  status: {
    code: 0,
    message,
    errorCode: null,
  },
  data,
});

export const paginated = <T>(
  content: T[],
  page: number,
  size: number,
  totalElements: number,
  message: string | null = null
): Response<{
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}> => ({
  status: {
    code: 0,
    message,
    errorCode: null,
  },
  data: {
    content,
    page,
    size,
    totalPages: Math.ceil(totalElements / size),
    totalElements,
  },
});
