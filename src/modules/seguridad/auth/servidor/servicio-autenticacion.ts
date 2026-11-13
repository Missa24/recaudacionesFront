import "server-only";

import {
  ErrorApiSeguridad,
  ErrorServicioSeguridad,
  solicitar,
} from "@/lib/http/cliente-seguridad";
import type { RolDeUsuario, UsuarioSeguridad } from "../../usuarios/tipos";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: servicio-autenticacion.ts
 *
 * Adaptador entre el frontend y los endpoints de autenticación del
 * backend. Traduce errores HTTP a resultados de dominio y evita que
 * credenciales o tokens aparezcan en mensajes y logs.
 */

/** Respuesta cruda de `POST /auth/login`. */
interface RespuestaLogin {
  access_token: string;
  expires_in: number;
  expires_at: string;
  token_type: string;
  user: {
    username: string;
    name: string;
    email: string;
    roles: string[];
  };
}

/** Identidad que devuelve `POST /auth/validate-token`. */
export interface IdentidadToken {
  username: string;
  name?: string;
  email?: string;
  roles?: string[];
}

/** Sesión emitida por el backend. */
export interface SesionBackend {
  token: string;
  expiraEn: Date;
  usuario: {
    username: string;
    name: string;
    email: string | null;
  };
}

/** Datos de contexto técnico que se envían al registrar la sesión. */
export interface DatosConexion {
  ipAddress: string | null;
  userAgent: string | null;
}

/**
 * Autentica credenciales contra `POST /auth/login`.
 *
 * @returns La sesión emitida, `null` si las credenciales son inválidas.
 * @throws {ErrorServicioSeguridad} Si el servicio no está disponible.
 */
export async function iniciarSesionEnBackend(
  username: string,
  password: string,
): Promise<SesionBackend | null> {
  try {
    const respuesta = await solicitar<RespuestaLogin>("/auth/login", {
      method: "POST",
      body: { username, password },
      credencialesInvalidasEn401: true,
    });

    const expiraEn = new Date(respuesta.expires_at);
    if (
      typeof respuesta.access_token !== "string" ||
      !respuesta.access_token ||
      !Number.isFinite(expiraEn.getTime()) ||
      expiraEn.getTime() <= Date.now()
    ) {
      throw new ErrorServicioSeguridad(
        "El servicio de autenticación devolvió una sesión inválida.",
      );
    }

    return {
      token: respuesta.access_token,
      expiraEn,
      usuario: {
        username: respuesta.user.username,
        name: respuesta.user.name || respuesta.user.username,
        email: respuesta.user.email?.trim() ? respuesta.user.email : null,
      },
    };
  } catch (error) {
    if (
      error instanceof ErrorApiSeguridad &&
      [400, 401, 403].includes(error.estado)
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Valida el token contra `POST /auth/validate-token`.
 *
 * @returns La identidad o `null` si el token ya no es válido.
 */
export async function validarTokenEnBackend(
  token: string,
): Promise<IdentidadToken | null> {
  try {
    const respuesta = await solicitar<{ valid: boolean; user: IdentidadToken }>(
      "/auth/validate-token",
      { method: "POST", token },
    );
    if (respuesta.valid !== true || typeof respuesta.user?.username !== "string") {
      return null;
    }
    return respuesta.user;
  } catch (error) {
    if (error instanceof ErrorApiSeguridad && [401, 403].includes(error.estado)) {
      return null;
    }
    throw error;
  }
}

/** Obtiene el registro `seguridad.usuario` por username. */
export async function obtenerUsuarioPorUsername(
  token: string,
  username: string,
): Promise<UsuarioSeguridad | null> {
  try {
    return await solicitar<UsuarioSeguridad>(
      `/usuarios/username/${encodeURIComponent(username)}`,
      { token },
    );
  } catch (error) {
    if (error instanceof ErrorApiSeguridad && error.estado === 404) return null;
    throw error;
  }
}

/** Obtiene los roles activos de un usuario. */
export async function obtenerRolesDeUsuario(
  token: string,
  usuarioId: string,
): Promise<RolDeUsuario[]> {
  try {
    const respuesta = await solicitar<{
      usuario_id: string;
      roles: RolDeUsuario[];
    }>(`/usuario-rol/usuario/${encodeURIComponent(usuarioId)}`, { token });
    return Array.isArray(respuesta.roles) ? respuesta.roles : [];
  } catch (error) {
    if (error instanceof ErrorApiSeguridad && error.estado === 404) return [];
    throw error;
  }
}

/**
 * Registra la sesión en `seguridad.sesion`.
 *
 * Es best-effort: si el registro falla, el login continúa y el contexto
 * guarda `sesion_id: null`. Así una caída del módulo de sesiones no
 * bloquea el acceso, aunque queda constancia en el log del servidor.
 */
export async function registrarSesionEnBackend(
  token: string,
  datos: DatosConexion,
): Promise<string | null> {
  try {
    const respuesta = await solicitar<{ id: string; message: string }>(
      "/sesion",
      {
        method: "POST",
        token,
        body: {
          ipAddress: datos.ipAddress ?? undefined,
          userAgent: datos.userAgent ?? undefined,
        },
      },
    );
    return typeof respuesta.id === "string" ? respuesta.id : null;
  } catch (error) {
    console.warn(
      "[seguridad] No se pudo registrar la sesión:",
      error instanceof Error ? error.name : "error desconocido",
    );
    return null;
  }
}

/** Cierra la sesión en el backend. No propaga errores al cierre local. */
export async function cerrarSesionEnBackend(
  token: string,
  sesionId: string,
): Promise<void> {
  try {
    await solicitar<{ id: string; message: string }>(
      `/sesion/${encodeURIComponent(sesionId)}/cerrar`,
      { method: "PATCH", token },
    );
  } catch (error) {
    console.warn(
      "[seguridad] No se pudo cerrar la sesión en el backend:",
      error instanceof Error ? error.name : "error desconocido",
    );
  }
}
