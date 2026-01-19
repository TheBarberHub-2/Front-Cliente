export interface Page<T> {
    data: T[];
    totalElements: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
}
