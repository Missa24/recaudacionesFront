import "server-only";

import { ErrorApiSeguridad, solicitar } from "@/lib/http/cliente-seguridad";
import {
  codigosRolSuperusuario,
} from "../../comun/constantes";
import type { ModuloNavegacion } from "../../modulos/tipos";
import { obtenerModulosActivos } from "../../modulos/servidor/servicio-modulos";
import type { RolSesion, UsuarioSesion } from "../tipos";
import {
  obtenerRolesDeUsuario,
  obtenerUsuarioPorUsername,
} from "./servicio-autenticacion";

/**
 * Módulo: Seguridad / Autorización
 * Archivo: servicio-autorizacion.ts
 *
 * Resuelve la autorización efectiva del usuario autenticado a partir del
 * modelo relacional:
 *
 *   usuario → usuario_rol → rol → rol_modulo_permiso → modulo / permiso
 *
 * La unión de permisos de todos los roles activos se guarda en la sesión.
 * Los módulos visibles son aquellos donde el usuario tiene al menos un
 * permiso activo.
 */

/** Error de negocio cuando el usuario autenticado no puede operar el sistema. */
export class ErrorUsuarioSinAcceso extends Error {
  constructor(readonly motivo: "no-registrado" | "inactivo") {
    super(
      motivo === "no-registrado"
        ? "El usuario no está registrado en el sistema."
        : "El usuario está inactivo.",
    );
    this.name = "ErrorUsuarioSinAcceso";
  }
}

/** Autorización efectiva lista para convertirse en sesión. */
export interface AutorizacionUsuario {
  usuario: UsuarioSesion;
  roles: RolSesion[];
  permisos: string[];
  modulos: ModuloNavegacion[];
}

/** Módulo con permisos devuelto por `GET /rol-modulo-permiso/rol/:id/permisos`. */
interface ModuloConPermisosBackend {
  id: string;
  nombre: string;
  codigo: string;
  ruta: string;
  permisos: Array<{ id: string; codigo: string; descripcion: string }>;
}

/** Respuesta de permisos de un rol. */
interface PermisosDeRolBackend {
  rol: { id: string; codigo: string; descripcion: string };
  modulos: ModuloConPermisosBackend[];
}

/** Consulta los módulos y permisos activos de un rol. */
async function obtenerModulosDeRol(
  token: string,
  rolId: string,
): Promise<ModuloConPermisosBackend[]> {
  try {
    const respuesta = await solicitar<PermisosDeRolBackend>(
      `/rol-modulo-permiso/rol/${encodeURIComponent(rolId)}/permisos`,
      { token },
    );
    return Array.isArray(respuesta.modulos) ? respuesta.modulos : [];
  } catch (error) {
    // Un rol sin permisos puede responder 404; no debe impedir el login.
    if (error instanceof ErrorApiSeguridad && error.estado === 404) return [];
    throw error;
  }
}

/**
 * Calcula roles, permisos y módulos efectivos de un usuario.
 *
 * @param token JWT del backend.
 * @param username Username autenticado por LDAP.
 * @throws {ErrorUsuarioSinAcceso} Si no existe el usuario o está inactivo.
 */
export async function resolverAutorizacion(
  token: string,
  username: string,
): Promise<AutorizacionUsuario> {
  const usuario = await obtenerUsuarioPorUsername(token, username);
  if (!usuario) throw new ErrorUsuarioSinAcceso("no-registrado");
  if (usuario.estado !== "ACTIVO") throw new ErrorUsuarioSinAcceso("inactivo");

  const roles = await obtenerRolesDeUsuario(token, usuario.id);
  const permisosPorRol = await Promise.all(
    roles.map((rol) => obtenerModulosDeRol(token, rol.id)),
  );

  const permisos = new Set<string>();
  const modulos = new Map<string, ModuloNavegacion>();

  for (const listaModulos of permisosPorRol) {
    for (const modulo of listaModulos) {
      if (!modulos.has(modulo.id)) {
        modulos.set(modulo.id, {
          id: modulo.id,
          codigo: modulo.codigo,
          nombre: modulo.nombre,
          descripcion: null,
          ruta: modulo.ruta,
        });
      }
      for (const permiso of modulo.permisos) {
        permisos.add(permiso.codigo);
      }
    }
  }

  const esSuperusuario = roles.some((rol) =>
    codigosRolSuperusuario().includes(rol.codigo.trim().toUpperCase()),
  );
  if (esSuperusuario) {
    permisos.add("*");
    // Arranque: un administrador sin matriz de permisos igual debe poder
    // navegar a los módulos para configurarlos.
    const todosLosModulos = await obtenerModulosActivos(token);
    for (const modulo of todosLosModulos) {
      if (!modulos.has(modulo.id)) {
        modulos.set(modulo.id, {
          id: modulo.id,
          codigo: modulo.codigo,
          nombre: modulo.nombre,
          descripcion: modulo.descripcion,
          ruta: modulo.ruta,
        });
      }
    }
  }

  return {
    usuario: {
      id: usuario.id,
      username: usuario.username ?? usuario.email,
      email: usuario.email,
      ci: usuario.ci,
      nombres: usuario.nombres,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      estado: usuario.estado,
      ultimo_acceso: usuario.ultimo_acceso,
    },
    roles: roles.map((rol) => ({
      id: rol.id,
      codigo: rol.codigo,
      descripcion: rol.descripcion,
    })),
    permisos: [...permisos].sort((izquierda, derecha) =>
      izquierda.localeCompare(derecha, "es"),
    ),
    modulos: [...modulos.values()]
      .filter((modulo) => modulo.ruta?.trim())
      .sort((izquierda, derecha) =>
        izquierda.nombre.localeCompare(derecha.nombre, "es"),
      ),
  };
}
