/**
 * Tipos que reflejan el contrato HTTP del backend NestJS
 * descrito en el README (envelope + paginación + errores).
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginatedResponse<T> extends ApiEnvelope<PaginatedData<T>> {}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  errors?: string[];
  path?: string;
  method?: string;
  timestamp?: string;
}

/** Error tipado que lanza el cliente HTTP. */
export class ApiError extends Error {
  statusCode: number;
  errors: string[];
  constructor(body: ApiErrorBody) {
    const msgs = Array.isArray(body.message) ? body.message : [body.message];
    super(msgs.join(", "));
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.errors = body.errors ?? msgs;
  }
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
  [key: string]: unknown;
}