import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina, ParametrosListado } from "../../comun/tipos";
import type { CrearPermisoDto, PermisoSeguridad } from "../tipos";

/**
 * Módulo: Seguridad / Permisos
 * Archivo: servicio-permisos.ts
 *
 * Acceso HTTP al catálogo de permisos funcionales que luego se asignan
 * a los roles dentro de cada módulo.
 */

/** Lista permisos con búsqueda, orden y paginación. */
export async function listarPermisos(
  token: string,
  parametros: ParametrosListado = {},
): Promise<Pagina<PermisoSeguridad>> {
  return solicitar<Pagina<PermisoSeguridad>>("/permiso", {
    token,
    query: {
      page: parametros.page ?? 1,
      limit: parametros.limit ?? 10,
      search: parametros.search,
      sortBy: parametros.sortBy ?? "codigo",
      sortOrder: parametros.sortOrder ?? "ASC",
      status: parametros.status ?? "TODOS",
    },
  });
}

/** Crea un permiso. */
export async function crearPermiso(
  token: string,
  datos: CrearPermisoDto,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>("/permiso", {
    method: "POST",
    token,
    body: datos,
  });
}

/** Actualiza un permiso. */
export async function actualizarPermiso(
  token: string,
  id: string,
  datos: Partial<CrearPermisoDto>,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(`/permiso/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: datos,
  });
}

/** Alterna el estado del permiso. */
export async function cambiarEstadoPermiso(
  token: string,
  id: string,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/permiso/${encodeURIComponent(id)}/estado`,
    { method: "PATCH", token },
  );
}
