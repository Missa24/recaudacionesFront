import type { ModuloNavegacion } from "../modulos/tipos";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: tipos.ts
 *
 * Modelo de sesión del frontend. Resume lo necesario para operar la
 * interfaz: identidad, roles, códigos de permiso y módulos navegables.
 *
 * El contexto se firma y se guarda en una cookie httpOnly; nunca se
 * expone el JWT ni el detalle completo de permisos al navegador.
 */

/** Identidad mínima del usuario autenticado. */
export interface UsuarioSesion {
  id: string;
  username: string;
  email: string;
  ci: string;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  estado: string;
  ultimo_acceso: string | null;
}

/** Rol activo del usuario. */
export interface RolSesion {
  id: string;
  codigo: string;
  descripcion: string;
}

/**
 * Contexto firmado que acompaña al JWT.
 *
 * `permisos` contiene códigos efectivos; un superusuario recibe `"*"`.
 * `modulos` solo incluye módulos donde el usuario tiene algún permiso.
 */
export interface ContextoSesion {
  /** Versión del formato, para invalidar cookies viejas tras un cambio. */
  v: 1;
  usuario: UsuarioSesion;
  roles: RolSesion[];
  permisos: string[];
  modulos: ModuloNavegacion[];
  /** UUID de la fila `seguridad.sesion`; `null` si no se pudo registrar. */
  sesion_id: string | null;
  /** Expiración del JWT del backend, en ISO 8601. */
  expira_en: string;
  /** Última vez que se recalcularon roles y permisos. */
  actualizado_en: string;
}

/** Par de token y contexto que solo existe en el servidor. */
export interface SesionServidor {
  token: string;
  contexto: ContextoSesion;
}

/** Resultado de la Server Action de login. */
export type ResultadoLogin =
  | { ok: true; redireccion: string }
  | { ok: false; mensaje: string };
