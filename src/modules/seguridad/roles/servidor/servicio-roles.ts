import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina, ParametrosListado } from "../../comun/tipos";
import type {
  CatalogoPermisos,
  CrearRolDto,
  MatrizPermisos,
  PermisosDeRol,
  RolSeguridad,
} from "../tipos";

/**
 * Módulo: Seguridad / Roles
 * Archivo: servicio-roles.ts
 *
 * Acceso HTTP a `rol` y a `rol-modulo-permiso`. La asignación de permisos
 * se hace por módulo con `PUT .../reemplazar`, que recibe la lista completa
 * de permisos de ese módulo (una lista vacía los desactiva todos).
 */

/** Lista roles con búsqueda, orden y paginación. */
export async function listarRoles(
  token: string,
  parametros: ParametrosListado = {},
): Promise<Pagina<RolSeguridad>> {
  return solicitar<Pagina<RolSeguridad>>("/rol", {
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

/** Obtiene un rol por UUID. */
export async function obtenerRol(
  token: string,
  id: string,
): Promise<RolSeguridad> {
  return solicitar<RolSeguridad>(`/rol/${encodeURIComponent(id)}`, { token });
}

/** Crea un rol. */
export async function crearRol(
  token: string,
  datos: CrearRolDto,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>("/rol", {
    method: "POST",
    token,
    body: datos,
  });
}

/** Actualiza un rol. */
export async function actualizarRol(
  token: string,
  id: string,
  datos: Partial<CrearRolDto>,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(`/rol/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: datos,
  });
}

/** Alterna el estado del rol. */
export async function cambiarEstadoRol(
  token: string,
  id: string,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/rol/${encodeURIComponent(id)}/estado`,
    { method: "PATCH", token },
  );
}

/** Catálogo de módulos y permisos activos. */
export async function obtenerCatalogoPermisos(
  token: string,
): Promise<CatalogoPermisos> {
  return solicitar<CatalogoPermisos>("/rol-modulo-permiso/catalogo", { token });
}

/** Módulos y permisos asignados a un rol. */
export async function obtenerPermisosDeRol(
  token: string,
  rolId: string,
): Promise<PermisosDeRol> {
  return solicitar<PermisosDeRol>(
    `/rol-modulo-permiso/rol/${encodeURIComponent(rolId)}/permisos`,
    { token },
  );
}

/**
 * Reemplaza los permisos de un rol dentro de un módulo.
 *
 * @param permisos IDs de permiso que quedarán activos para ese módulo.
 */
export async function reemplazarPermisosDeRol(
  token: string,
  rolId: string,
  moduloId: string,
  permisos: string[],
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/rol-modulo-permiso/rol/${encodeURIComponent(rolId)}/modulo/${encodeURIComponent(moduloId)}/reemplazar`,
    { method: "PUT", token, body: { permisos } },
  );
}

/** Convierte la respuesta del backend en una matriz `moduloId → permisoIds`. */
export function matrizDesdePermisos(permisos: PermisosDeRol): MatrizPermisos {
  const matriz: MatrizPermisos = {};
  for (const modulo of permisos.modulos) {
    matriz[modulo.id] = modulo.permisos.map((permiso) => permiso.id);
  }
  return matriz;
}
