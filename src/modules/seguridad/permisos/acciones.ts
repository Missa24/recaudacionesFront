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
import type { CrearPermisoDto, PermisoSeguridad } from "./tipos";
import {
  actualizarPermiso,
  cambiarEstadoPermiso,
  crearPermiso,
  listarPermisos,
} from "./servidor/servicio-permisos";

/**
 * Módulo: Seguridad / Permisos
 * Archivo: acciones.ts
 *
 * Server Actions del catálogo de permisos.
 */

/** Lista permisos para la tabla paginada. */
export async function listarPermisosAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<PermisoSeguridad>> {
  const resultado = await ejecutarLectura(PERMISOS.permisoVer, ({ token }) =>
    listarPermisos(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

/** Crea un permiso. */
export async function crearPermisoAction(
  datos: CrearPermisoDto,
): Promise<ResultadoAccion> {
  const codigo = datos.codigo.trim().toUpperCase();
  const descripcion = datos.descripcion.trim();
  if (!codigo || !descripcion) {
    return { ok: false, mensaje: "El código y la descripción son obligatorios." };
  }

  return ejecutarAccion(
    PERMISOS.permisoCrear,
    async ({ token }) => {
      const respuesta = await crearPermiso(token, { codigo, descripcion });
      return respuesta.message || "Permiso registrado correctamente.";
    },
    [RUTAS.permisos],
  );
}

/** Actualiza un permiso. */
export async function actualizarPermisoAction(
  id: string,
  datos: Partial<CrearPermisoDto>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.permisoEditar,
    async ({ token }) => {
      const respuesta = await actualizarPermiso(token, id, {
        codigo: datos.codigo?.trim().toUpperCase(),
        descripcion: datos.descripcion?.trim(),
      });
      return respuesta.message || "Permiso actualizado correctamente.";
    },
    [RUTAS.permisos],
  );
}

/** Alterna el estado del permiso. */
export async function cambiarEstadoPermisoAction(
  id: string,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.permisoEstado,
    async ({ token }) => {
      const respuesta = await cambiarEstadoPermiso(token, id);
      return respuesta.message || "Estado del permiso actualizado.";
    },
    [RUTAS.permisos],
  );
}
