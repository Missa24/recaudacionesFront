/**
 * Módulo: Seguridad / Usuarios
 * Archivo: tipos.ts
 *
 * Contrato del recurso `seguridad.usuario`.
 *
 * Nota sobre nombres: las respuestas del backend usan snake_case
 * (`apellido_paterno`, `ultimo_acceso`) mientras que los DTO de entrada
 * usan camelCase (`apellidoPaterno`), tal como están declarados con
 * `class-validator`. Se respeta esa asimetría para no romper el contrato.
 */

/** Usuario tal como lo devuelve `GET /usuarios`. */
export interface UsuarioSeguridad {
  id: string;
  username: string | null;
  email: string;
  ci: string;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  celular: string | null;
  estado: string;
  ultimo_acceso: string | null;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
  responsable_eliminacion: string | null;
}

/** Datos aceptados por `POST /usuarios`. */
export interface CrearUsuarioDto {
  username?: string;
  email: string;
  ci: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  celular?: string;
}

/** Datos aceptados por `PATCH /usuarios/:id`. */
export type ActualizarUsuarioDto = Partial<CrearUsuarioDto>;

/** Rol resumido que devuelve `GET /usuario-rol/usuario/:id`. */
export interface RolDeUsuario {
  id: string;
  codigo: string;
  descripcion: string;
}

/** Respuesta de `GET /usuario-rol/usuario/:id`. */
export interface RolesDeUsuario {
  usuario_id: string;
  roles: RolDeUsuario[];
}
