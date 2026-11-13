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
import type {
  CatalogoPermisos,
  CrearRolDto,
  MatrizPermisos,
  PermisosDeRol,
  RolSeguridad,
} from "./tipos";
import {
  actualizarRol,
  cambiarEstadoRol,
  crearRol,
  listarRoles,
  matrizDesdePermisos,
  obtenerCatalogoPermisos,
  obtenerPermisosDeRol,
  reemplazarPermisosDeRol,
} from "./servidor/servicio-roles";

/**
 * Módulo: Seguridad / Roles
 * Archivo: acciones.ts
 *
 * Server Actions del catálogo de roles y de la matriz de permisos.
 */

/** Cambio de permisos de un módulo concreto. */
export interface CambioPermisosModulo {
  moduloId: string;
  permisos: string[];
}

/** Patrón de UUID v4, para no enviar identificadores arbitrarios. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valida el formato del código de rol que exige el backend. */
function codigoValido(codigo: string): boolean {
  return /^[A-Z0-9_]{1,40}$/.test(codigo);
}

/** Lista roles para la tabla paginada. */
export async function listarRolesAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<RolSeguridad>> {
  const resultado = await ejecutarLectura(PERMISOS.rolVer, ({ token }) =>
    listarRoles(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

/** Crea un rol. */
export async function crearRolAction(
  datos: CrearRolDto,
): Promise<ResultadoAccion> {
  const codigo = datos.codigo.trim().toUpperCase();
  const descripcion = datos.descripcion.trim();
  if (!codigoValido(codigo)) {
    return {
      ok: false,
      mensaje: "El código solo admite mayúsculas, números y guion bajo (máx. 40).",
    };
  }
  if (!descripcion) {
    return { ok: false, mensaje: "La descripción es obligatoria." };
  }

  return ejecutarAccion(
    PERMISOS.rolCrear,
    async ({ token }) => {
      const respuesta = await crearRol(token, { codigo, descripcion });
      return respuesta.message || "Rol registrado correctamente.";
    },
    [RUTAS.roles],
  );
}

/** Actualiza un rol. */
export async function actualizarRolAction(
  id: string,
  datos: Partial<CrearRolDto>,
): Promise<ResultadoAccion> {
  if (!UUID.test(id)) return { ok: false, mensaje: "Rol no válido." };

  return ejecutarAccion(
    PERMISOS.rolEditar,
    async ({ token }) => {
      const respuesta = await actualizarRol(token, id, {
        codigo: datos.codigo?.trim().toUpperCase(),
        descripcion: datos.descripcion?.trim(),
      });
      return respuesta.message || "Rol actualizado correctamente.";
    },
    [RUTAS.roles],
  );
}

/** Alterna el estado del rol. */
export async function cambiarEstadoRolAction(
  id: string,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.rolEstado,
    async ({ token }) => {
      const respuesta = await cambiarEstadoRol(token, id);
      return respuesta.message || "Estado del rol actualizado.";
    },
    [RUTAS.roles],
  );
}

/**
 * Carga el catálogo y la matriz actual del rol para el editor de permisos.
 */
export async function obtenerPermisosRolAction(rolId: string): Promise<
  | {
      ok: true;
      catalogo: CatalogoPermisos;
      permisos: PermisosDeRol;
      matriz: MatrizPermisos;
    }
  | { ok: false; mensaje: string }
> {
  const resultado = await ejecutarLectura(PERMISOS.rolAsignarPermiso, async ({ token }) => {
    const [catalogo, permisos] = await Promise.all([
      obtenerCatalogoPermisos(token),
      obtenerPermisosDeRol(token, rolId),
    ]);
    return { catalogo, permisos };
  });

  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
  return {
    ok: true,
    catalogo: resultado.datos.catalogo,
    permisos: resultado.datos.permisos,
    matriz: matrizDesdePermisos(resultado.datos.permisos),
  };
}

/**
 * Guarda los cambios de la matriz de permisos.
 *
 * Solo se envían los módulos modificados; cada uno se reemplaza con la
 * lista completa de permisos marcados.
 */
export async function guardarPermisosRolAction(
  rolId: string,
  cambios: CambioPermisosModulo[],
): Promise<ResultadoAccion> {
  if (cambios.length === 0) {
    return { ok: true, mensaje: "No hay cambios en los permisos." };
  }
  if (
    cambios.some(
      (cambio) =>
        !UUID.test(cambio.moduloId) ||
        cambio.permisos.some((permiso) => !UUID.test(permiso)),
    )
  ) {
    return { ok: false, mensaje: "La selección de permisos no es válida." };
  }

  return ejecutarAccion(
    PERMISOS.rolAsignarPermiso,
    async ({ token }) => {
      for (const cambio of cambios) {
        await reemplazarPermisosDeRol(
          token,
          rolId,
          cambio.moduloId,
          cambio.permisos,
        );
      }
      return "Permisos del rol actualizados correctamente.";
    },
    [RUTAS.roles],
  );
}

/** Roles activos para selectores (asignación de usuarios). */
export async function listarRolesActivosAction(): Promise<
  { ok: true; roles: RolSeguridad[] } | { ok: false; mensaje: string }
> {
  const resultado = await ejecutarLectura(PERMISOS.rolVer, ({ token }) =>
    listarRoles(token, {
      page: 1,
      limit: 100,
      status: "ACTIVO",
      sortBy: "codigo",
      sortOrder: "ASC",
    }),
  );
  return resultado.ok
    ? { ok: true, roles: resultado.datos.items }
    : { ok: false, mensaje: resultado.mensaje };
}
