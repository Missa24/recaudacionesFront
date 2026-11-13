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
import type { CrearModuloDto, ModuloSeguridad } from "./tipos";
import {
  actualizarModulo,
  cambiarEstadoModulo,
  crearModulo,
  listarModulos,
} from "./servidor/servicio-modulos";

/**
 * Módulo: Seguridad / Módulos
 * Archivo: acciones.ts
 *
 * Server Actions del catálogo de módulos funcionales.
 */

/** Lista módulos para la tabla paginada. */
export async function listarModulosAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<ModuloSeguridad>> {
  const resultado = await ejecutarLectura(PERMISOS.moduloVer, ({ token }) =>
    listarModulos(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

/** Crea un módulo. */
export async function crearModuloAction(
  datos: CrearModuloDto,
): Promise<ResultadoAccion> {
  const nombre = datos.nombre.trim();
  const codigo = datos.codigo.trim().toUpperCase();
  const ruta = datos.ruta.trim();
  if (!nombre || !codigo || !ruta) {
    return { ok: false, mensaje: "Nombre, código y ruta son obligatorios." };
  }
  if (!ruta.startsWith("/")) {
    return { ok: false, mensaje: "La ruta debe empezar con '/'." };
  }

  return ejecutarAccion(
    PERMISOS.moduloCrear,
    async ({ token }) => {
      const respuesta = await crearModulo(token, {
        nombre,
        codigo,
        ruta,
        descripcion: datos.descripcion?.trim() || null,
      });
      return respuesta.message || "Módulo registrado correctamente.";
    },
    [RUTAS.modulos],
  );
}

/** Actualiza un módulo. */
export async function actualizarModuloAction(
  id: string,
  datos: Partial<CrearModuloDto>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.moduloEditar,
    async ({ token }) => {
      const respuesta = await actualizarModulo(token, id, {
        nombre: datos.nombre?.trim(),
        codigo: datos.codigo?.trim().toUpperCase(),
        ruta: datos.ruta?.trim(),
        descripcion:
          datos.descripcion === undefined
            ? undefined
            : datos.descripcion?.trim() || null,
      });
      return respuesta.message || "Módulo actualizado correctamente.";
    },
    [RUTAS.modulos],
  );
}

/** Alterna el estado del módulo. */
export async function cambiarEstadoModuloAction(
  id: string,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.moduloEstado,
    async ({ token }) => {
      const respuesta = await cambiarEstadoModulo(token, id);
      return respuesta.message || "Estado del módulo actualizado.";
    },
    [RUTAS.modulos],
  );
}
