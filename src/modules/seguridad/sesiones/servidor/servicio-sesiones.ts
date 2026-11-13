import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina } from "../../comun/tipos";
import type { SesionSeguridad } from "../tipos";

/**
 * Módulo: Seguridad / Sesiones
 * Archivo: servicio-sesiones.ts
 *
 * Consulta y cierre de las sesiones del usuario autenticado. El backend
 * limita `PATCH /sesion/:id/cerrar` al dueño de la sesión, por lo que esta
 * fase no expone cierre de sesiones ajenas.
 */

/** Parámetros del historial propio. */
export interface ParametrosSesiones {
  page?: number;
  limit?: number;
  sortBy?: "inicio" | "fin" | "estado";
  sortOrder?: "ASC" | "DESC";
  status?: string;
  startDate?: string;
  endDate?: string;
}

/** Historial paginado de sesiones del usuario autenticado. */
export async function listarMisSesiones(
  token: string,
  parametros: ParametrosSesiones = {},
): Promise<Pagina<SesionSeguridad>> {
  return solicitar<Pagina<SesionSeguridad>>("/sesion/mis-sesiones", {
    token,
    query: {
      page: parametros.page ?? 1,
      limit: parametros.limit ?? 10,
      sortBy: parametros.sortBy ?? "inicio",
      sortOrder: parametros.sortOrder ?? "DESC",
      status: parametros.status,
      startDate: parametros.startDate,
      endDate: parametros.endDate,
    },
  });
}

/** Cierra una sesión activa del usuario autenticado. */
export async function cerrarSesionPorId(
  token: string,
  id: string,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/sesion/${encodeURIComponent(id)}/cerrar`,
    { method: "PATCH", token },
  );
}
