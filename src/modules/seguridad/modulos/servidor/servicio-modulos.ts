import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina, ParametrosListado } from "../../comun/tipos";
import type { CrearModuloDto, ModuloSeguridad } from "../tipos";

/**
 * Módulo: Seguridad / Módulos
 * Archivo: servicio-modulos.ts
 *
 * Acceso HTTP al catálogo de módulos funcionales. La `ruta` de cada
 * módulo alimenta el menú lateral del shell.
 */

/** Lista módulos con búsqueda, orden y paginación. */
export async function listarModulos(
  token: string,
  parametros: ParametrosListado = {},
): Promise<Pagina<ModuloSeguridad>> {
  return solicitar<Pagina<ModuloSeguridad>>("/modulo", {
    token,
    query: {
      page: parametros.page ?? 1,
      limit: parametros.limit ?? 10,
      search: parametros.search,
      sortBy: parametros.sortBy ?? "nombre",
      sortOrder: parametros.sortOrder ?? "ASC",
      status: parametros.status ?? "TODOS",
    },
  });
}

/**
 * Módulos activos, sin paginar (máximo 100).
 *
 * Se usa para dar navegación completa a un superusuario que todavía no
 * tiene filas en `rol_modulo_permiso` (arranque del sistema).
 */
export async function obtenerModulosActivos(
  token: string,
): Promise<ModuloSeguridad[]> {
  const pagina = await listarModulos(token, {
    page: 1,
    limit: 100,
    status: "ACTIVO",
    sortBy: "nombre",
    sortOrder: "ASC",
  });
  return pagina.items;
}

/** Crea un módulo. */
export async function crearModulo(
  token: string,
  datos: CrearModuloDto,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>("/modulo", {
    method: "POST",
    token,
    body: datos,
  });
}

/** Actualiza un módulo. */
export async function actualizarModulo(
  token: string,
  id: string,
  datos: Partial<CrearModuloDto>,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(`/modulo/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: datos,
  });
}

/** Alterna el estado del módulo. */
export async function cambiarEstadoModulo(
  token: string,
  id: string,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/modulo/${encodeURIComponent(id)}/estado`,
    { method: "PATCH", token },
  );
}
