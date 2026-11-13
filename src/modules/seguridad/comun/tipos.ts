/**
 * Módulo: Seguridad / Común
 * Archivo: tipos.ts
 *
 * Tipos transversales a todos los módulos de seguridad. Reflejan el
 * contrato HTTP real del backend NestJS de Recaudaciones:
 * envelope `{ success, status, data }` y paginación `{ items, pagination }`.
 */

/** Estados lógicos usados por las tablas del esquema `seguridad`. */
export type EstadoRegistro = "ACTIVO" | "INACTIVO";

/** Filtro de estado aceptado por los listados del backend. */
export type FiltroEstado = EstadoRegistro | "TODOS";

/** Metadatos de paginación devueltos por `PaginatedResponse`. */
export interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Listado paginado genérico. */
export interface Pagina<T> {
  items: T[];
  pagination: Paginacion;
}

/**
 * Parámetros de consulta compartidos por los listados.
 *
 * El backend limita `limit` a 100 registros y ordena por `createdAt`
 * de forma descendente cuando no se indica otra cosa.
 */
export interface ParametrosListado {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: FiltroEstado;
}

/**
 * Resultado uniforme de una Server Action.
 *
 * Las acciones nunca lanzan errores de negocio hacia el cliente: los
 * traducen a mensajes seguros para que los formularios puedan mostrarlos.
 */
export type ResultadoAccion =
  | { ok: true; mensaje: string }
  | { ok: false; mensaje: string };

/**
 * Resultado de una Server Action de listado.
 *
 * Se usa cuando el cliente necesita refrescar una tabla sin recargar la
 * página; el error se devuelve en vez de lanzarse para que la UI muestre
 * un mensaje controlado.
 */
export type ResultadoListado<T> =
  | { ok: true; pagina: Pagina<T> }
  | { ok: false; mensaje: string };
