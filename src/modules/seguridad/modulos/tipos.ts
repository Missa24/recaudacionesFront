/**
 * Módulo: Seguridad / Módulos
 * Archivo: tipos.ts
 *
 * Contrato del recurso `seguridad.modulo`. Un módulo agrupa permisos y
 * aporta la ruta de navegación que consume el shell de la aplicación.
 */

/** Módulo tal como lo devuelve `GET /modulo`. */
export interface ModuloSeguridad {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  ruta: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/** Datos aceptados por `POST /modulo` y `PATCH /modulo/:id`. */
export interface CrearModuloDto {
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  ruta: string;
}

/**
 * Módulo reducido que se guarda en la sesión y se muestra en el menú.
 * Solo incluye los módulos donde el usuario tiene al menos un permiso.
 */
export interface ModuloNavegacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  ruta: string;
}
