/**
 * Módulo: Seguridad / Común
 * Archivo: utilidades.ts
 *
 * Formateadores y helpers de presentación compartidos por las pantallas
 * de seguridad. No contienen lógica de autorización.
 */

/** Fecha corta en hora de Bolivia. */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (!Number.isFinite(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

/** Fecha y hora en hora de Bolivia. */
export function formatearFechaHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (!Number.isFinite(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

/** Texto o guion largo cuando el valor es vacío. */
export function textoOMa(valor: string | null | undefined): string {
  return valor?.trim() ? valor : "—";
}

/** Nombre completo armado con los campos del usuario. */
export function nombreDeUsuario(usuario: {
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  username?: string | null;
}): string {
  const partes = [
    usuario.nombres,
    usuario.apellido_paterno,
    usuario.apellido_materno,
  ]
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte));

  return partes.length > 0 ? partes.join(" ") : (usuario.username ?? "—");
}

/** Recorta un user-agent para mostrarlo en la tabla de sesiones. */
export function resumirUserAgent(valor: string | null): string {
  if (!valor) return "—";
  return valor.length > 60 ? `${valor.slice(0, 57)}…` : valor;
}
