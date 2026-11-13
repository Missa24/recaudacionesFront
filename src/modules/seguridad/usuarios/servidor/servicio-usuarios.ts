import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina, ParametrosListado } from "../../comun/tipos";
import type {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  RolDeUsuario,
  RolesDeUsuario,
  UsuarioSeguridad,
} from "../tipos";

/**
 * Módulo: Seguridad / Usuarios
 * Archivo: servicio-usuarios.ts
 *
 * Capa de acceso HTTP al recurso `usuarios`. Los componentes y acciones
 * nunca llaman a `fetch` directamente: pasan por aquí.
 */

/** Parámetros propios del listado de usuarios. */
export interface ParametrosUsuarios extends ParametrosListado {
  /** Por defecto se muestran activos e inactivos. */
  status?: ParametrosListado["status"];
}

/** Lista usuarios con búsqueda, orden y paginación. */
export async function listarUsuarios(
  token: string,
  parametros: ParametrosUsuarios = {},
): Promise<Pagina<UsuarioSeguridad>> {
  return solicitar<Pagina<UsuarioSeguridad>>("/usuarios", {
    token,
    query: {
      page: parametros.page ?? 1,
      limit: parametros.limit ?? 10,
      search: parametros.search,
      sortBy: parametros.sortBy ?? "createdAt",
      sortOrder: parametros.sortOrder ?? "DESC",
      status: parametros.status ?? "TODOS",
    },
  });
}

/** Obtiene un usuario por UUID. */
export async function obtenerUsuario(
  token: string,
  id: string,
): Promise<UsuarioSeguridad> {
  return solicitar<UsuarioSeguridad>(`/usuarios/${encodeURIComponent(id)}`, {
    token,
  });
}

/** Registra un usuario. El alta de credenciales ocurre en LDAP. */
export async function crearUsuario(
  token: string,
  datos: CrearUsuarioDto,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>("/usuarios", {
    method: "POST",
    token,
    body: datos,
  });
}

/** Actualiza parcialmente un usuario. */
export async function actualizarUsuario(
  token: string,
  id: string,
  datos: ActualizarUsuarioDto,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(`/usuarios/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: datos,
  });
}

/** Alterna el estado de un usuario entre ACTIVO e INACTIVO. */
export async function cambiarEstadoUsuario(
  token: string,
  id: string,
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/usuarios/${encodeURIComponent(id)}/estado`,
    { method: "PATCH", token },
  );
}

/** Roles activos asignados a un usuario. */
export async function obtenerRolesDeUsuario(
  token: string,
  usuarioId: string,
): Promise<RolDeUsuario[]> {
  const respuesta = await solicitar<RolesDeUsuario>(
    `/usuario-rol/usuario/${encodeURIComponent(usuarioId)}`,
    { token },
  );
  return Array.isArray(respuesta.roles) ? respuesta.roles : [];
}

/** Asigna uno o varios roles activos al usuario. */
export async function asignarRolesAUsuario(
  token: string,
  usuarioId: string,
  roles: string[],
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/usuario-rol/usuario/${encodeURIComponent(usuarioId)}/roles`,
    { method: "POST", token, body: { roles } },
  );
}

/** Desactiva (eliminación lógica) uno o varios roles del usuario. */
export async function desactivarRolesDeUsuario(
  token: string,
  usuarioId: string,
  roles: string[],
): Promise<{ message: string }> {
  return solicitar<{ message: string }>(
    `/usuario-rol/usuario/${encodeURIComponent(usuarioId)}/desactivar-roles`,
    { method: "PATCH", token, body: { roles } },
  );
}
