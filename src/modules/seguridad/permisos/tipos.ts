/**
 * Módulo: Seguridad / Permisos
 * Archivo: tipos.ts
 *
 * Contrato del catálogo `seguridad.permiso`. Los permisos son códigos
 * funcionales (`USUARIO_CREAR`, `ROL_ASIGNAR_PERMISO`, …) que se asignan
 * a un rol dentro de un módulo.
 */

/** Permiso tal como lo devuelve `GET /permiso`. */
export interface PermisoSeguridad {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/** Datos aceptados por `POST /permiso` y `PATCH /permiso/:id`. */
export interface CrearPermisoDto {
  codigo: string;
  descripcion: string;
}
