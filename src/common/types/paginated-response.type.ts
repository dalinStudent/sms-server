export type PaginatedResponse<T> = {
    content: Array<T>;
    first: boolean;
    last: boolean;
    totalElements: number;
    totalPages: number;
}