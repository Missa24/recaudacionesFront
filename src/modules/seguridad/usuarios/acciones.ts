"use server";

import { PERMISOS, RUTAS } from "../comun/constantes";
import type { ParametrosListado, ResultadoAccion, ResultadoListado } from "../comun/tipos";
import { ejecutarAccion, ejecutarLectura } from "../auth/servidor/accion-protegida";
import type {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  RolDeUsuario,
  UsuarioSeguridad,
} from "./tipos";
import {
  actualizarUsuario,
  asignarRolesAUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  desactivarRolesDeUsuario,
  listarUsuarios,
  obtenerRolesDeUsuario,
} from "./servidor/servicio-usuarios";
import { listarRoles } from "../roles/servidor/servicio-roles";

/**
 * Módulo: Seguridad / Usuarios
 * Archivo: acciones.ts
 *
 * Server Actions del módulo. Toda escritura verifica el permiso en el
 * servidor antes de llamar al backend; la UI solo oculta botones, nunca
 * es la única defensa.
 */

/** Texto obligatorio, recortado. */
function texto(valor: string | undefined | null): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Lista usuarios para la tabla paginada. */
export async function listarUsuariosAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<UsuarioSeguridad>> {
  const resultado = await ejecutarLectura(PERMISOS.usuarioVer, ({ token }) =>
    listarUsuarios(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

/** Crea un usuario del sistema (las credenciales viven en LDAP). */
export async function crearUsuarioAction(
  datos: CrearUsuarioDto,
): Promise<ResultadoAccion> {
  const email = texto(datos.email);
  const ci = texto(datos.ci);
  const username = texto(datos.username);
  if (!username) {
    return {
      ok: false,
      mensaje: "El nombre de usuario es obligatorio para poder iniciar sesión.",
    };
  }
  if (!email || !ci) {
    return { ok: false, mensaje: "El correo electrónico y la CI son obligatorios." };
  }

  return ejecutarAccion(
    PERMISOS.usuarioCrear,
    async ({ token }) => {
      const respuesta = await crearUsuario(token, {
        ...datos,
        email,
        ci,
        username,
        nombres: texto(datos.nombres) || undefined,
        apellidoPaterno: texto(datos.apellidoPaterno) || undefined,
        apellidoMaterno: texto(datos.apellidoMaterno) || undefined,
        celular: texto(datos.celular) || undefined,
      });
      return respuesta.message || "Usuario registrado correctamente.";
    },
    [RUTAS.usuarios],
  );
}

/** Actualiza los datos de un usuario. */
export async function actualizarUsuarioAction(
  id: string,
  datos: ActualizarUsuarioDto,
): Promise<ResultadoAccion> {
  if (!texto(id)) return { ok: false, mensaje: "Usuario no válido." };

  return ejecutarAccion(
    PERMISOS.usuarioEditar,
    async ({ token }) => {
      const respuesta = await actualizarUsuario(token, id, {
        ...datos,
        username: texto(datos.username) || undefined,
        email: texto(datos.email) || undefined,
        ci: texto(datos.ci) || undefined,
        nombres: texto(datos.nombres) || undefined,
        apellidoPaterno: texto(datos.apellidoPaterno) || undefined,
        apellidoMaterno: texto(datos.apellidoMaterno) || undefined,
        celular: texto(datos.celular) || undefined,
      });
      return respuesta.message || "Usuario actualizado correctamente.";
    },
    [RUTAS.usuarios],
  );
}

/** Alterna el estado del usuario. */
export async function cambiarEstadoUsuarioAction(
  id: string,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.usuarioEstado,
    async ({ token }) => {
      const respuesta = await cambiarEstadoUsuario(token, id);
      return respuesta.message || "Estado del usuario actualizado.";
    },
    [RUTAS.usuarios],
  );
}

/** Roles asignados, para precargar el diálogo de gestión. */
export async function obtenerRolesDeUsuarioAction(
  usuarioId: string,
): Promise<{ ok: true; roles: RolDeUsuario[] } | { ok: false; mensaje: string }> {
  const resultado = await ejecutarLectura(PERMISOS.usuarioVer, ({ token }) =>
    obtenerRolesDeUsuario(token, usuarioId),
  );
  return resultado.ok
    ? { ok: true, roles: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

/** Roles activos disponibles para asignar. */
export async function listarRolesDisponiblesAction(): Promise<
  { ok: true; roles: RolDeUsuario[] } | { ok: false; mensaje: string }
> {
  const resultado = await ejecutarLectura(PERMISOS.usuarioAsignarRol, ({ token }) =>
    listarRoles(token, {
      page: 1,
      limit: 100,
      status: "ACTIVO",
      sortBy: "codigo",
      sortOrder: "ASC",
    }),
  );

  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };

  return {
    ok: true,
    roles: resultado.datos.items.map((rol) => ({
      id: rol.id,
      codigo: rol.codigo,
      descripcion: rol.descripcion,
    })),
  };
}

/**
 * Aplica el diferencial de roles de un usuario.
 *
 * El backend no ofrece una operación atómica de reemplazo: se asignan los
 * nuevos y luego se desactivan los retirados. Si el primer paso falla, no
 * se ejecuta el segundo y la UI informa el error.
 */
export async function guardarRolesDeUsuarioAction(
  usuarioId: string,
  agregar: string[],
  quitar: string[],
): Promise<ResultadoAccion> {
  if (agregar.length === 0 && quitar.length === 0) {
    return { ok: true, mensaje: "No hay cambios en los roles." };
  }

  return ejecutarAccion(
    PERMISOS.usuarioAsignarRol,
    async ({ token }) => {
      if (agregar.length > 0) {
        await asignarRolesAUsuario(token, usuarioId, agregar);
      }
      if (quitar.length > 0) {
        await desactivarRolesDeUsuario(token, usuarioId, quitar);
      }
      return "Roles del usuario actualizados correctamente.";
    },
    [RUTAS.usuarios],
  );
}
