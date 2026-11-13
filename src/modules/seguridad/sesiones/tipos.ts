/**
 * Módulo: Seguridad / Sesiones
 * Archivo: tipos.ts
 *
 * Contrato del recurso `seguridad.sesion`.
 *
 * El backend devuelve `ipAddress` en camelCase, aunque la columna se llame
 * `ip_address`; se respeta el nombre serializado.
 */

/** Sesión de acceso registrada en el backend. */
export interface SesionSeguridad {
  id: string;
  usuario_id: string;
  username: string | null;
  inicio: string;
  fin: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  estado: string;
  responsable_creacion: string | null;
  responsable_actualizacion: string | null;
}
