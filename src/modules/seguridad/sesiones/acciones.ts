"use server";

import { PERMISOS, RUTAS } from "../comun/constantes";
import type {
  ParametrosListado,
  ResultadoAccion,
  ResultadoListado,
} from "../comun/tipos";
import {
  ejecutarAccion,
  ejecutarLectura,
} from "../auth/servidor/accion-protegida";
import type { SesionSeguridad } from "./tipos";
import {
  cerrarSesionPorId,
  listarMisSesiones,
} from "./servidor/servicio-sesiones";

/**
 * Módulo: Seguridad / Sesiones
 * Archivo: acciones.ts
 *
 * Server Actions del historial de sesiones propio. Cerrar una sesión
 * distinta a la actual se hace desde la misma tabla; el backend valida
 * que pertenezca al usuario autenticado.
 */

const CAMPOS_ORDEN = ["inicio", "fin", "estado"] as const;
type CampoOrden = (typeof CAMPOS_ORDEN)[number];

/** Lista el historial paginado de sesiones del usuario. */
export async function listarMisSesionesAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<SesionSeguridad>> {
  const sortBy = CAMPOS_ORDEN.includes(parametros.sortBy as CampoOrden)
    ? (parametros.sortBy as CampoOrden)
    : "inicio";

  const resultado = await ejecutarLectura(PERMISOS.sesionVer, ({ token }) =>
    listarMisSesiones(token, {
      page: parametros.page,
      limit: parametros.limit,
      sortBy,
      sortOrder: parametros.sortOrder,
      status: parametros.status,
    }),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

/** Cierra una sesión activa del usuario. */
export async function cerrarSesionPorIdAction(
  id: string,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.sesionCerrar,
    async ({ token }) => {
      const respuesta = await cerrarSesionPorId(token, id);
      return respuesta.message || "Sesión cerrada correctamente.";
    },
    [RUTAS.sesiones],
  );
}
