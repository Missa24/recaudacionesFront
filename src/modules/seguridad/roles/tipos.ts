/**
 * Módulo: Seguridad / Roles
 * Archivo: tipos.ts
 *
 * Contrato del recurso `seguridad.rol` y de las asignaciones
 * rol–módulo–permiso que definen la autorización efectiva.
 */

/** Rol tal como lo devuelve `GET /rol`. */
export interface RolSeguridad {
  id: string;
  codigo: string;
  descripcion: string;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}

/** Datos aceptados por `POST /rol` y `PATCH /rol/:id`. */
export interface CrearRolDto {
  codigo: string;
  descripcion: string;
}

/** Permiso asignado dentro de un módulo. */
export interface PermisoAsignado {
  id: string;
  codigo: string;
  descripcion: string;
}

/** Módulo con los permisos que tiene un rol. */
export interface ModuloConPermisos {
  id: string;
  nombre: string;
  codigo: string;
  ruta: string;
  permisos: PermisoAsignado[];
}

/** Respuesta de `GET /rol-modulo-permiso/rol/:rolId/permisos`. */
export interface PermisosDeRol {
  rol: {
    id: string;
    codigo: string;
    descripcion: string;
  };
  modulos: ModuloConPermisos[];
}

/** Catálogo completo de módulos y permisos activos. */
export interface CatalogoPermisos {
  modulos: Array<{
    id: string;
    nombre: string;
    codigo: string;
    ruta: string;
  }>;
  permisos: PermisoAsignado[];
}

/**
 * Matriz editable de permisos por módulo.
 * Las claves son `moduloId` y los valores, los IDs de permiso marcados.
 */
export type MatrizPermisos = Record<string, string[]>;
