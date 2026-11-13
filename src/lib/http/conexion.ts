import "server-only";

/**
 * Módulo: Seguridad / Infraestructura
 * Archivo: conexion.ts
 *
 * Extrae la IP y el user-agent del cliente para registrarlos en
 * `seguridad.sesion`. La IP se valida porque la columna es `inet`: un valor
 * con puerto o con comas haría fallar el INSERT en PostgreSQL.
 */

/** Contexto técnico de la conexión. */
export interface DatosConexion {
  ipAddress: string | null;
  userAgent: string | null;
}

/** IPv4 o IPv6 simple, sin puerto ni sufijo de zona. */
const PATRON_IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const PATRON_IPV6 = /^[0-9a-f:]+$/i;

/** Quita el puerto de una IP (`1.2.3.4:5678`, `[::1]:5678`). */
function normalizarIp(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const limpia = valor.trim();
  if (!limpia) return null;

  const sinCorchetes = limpia.startsWith("[")
    ? limpia.slice(1, limpia.indexOf("]") > 0 ? limpia.indexOf("]") : undefined)
    : limpia;

  if (PATRON_IPV4.test(sinCorchetes)) return sinCorchetes;

  // IPv6 con puerto: se conserva solo la parte anterior al último `:`.
  const sinPuerto =
    !sinCorchetes.includes("::") && sinCorchetes.split(":").length === 2
      ? sinCorchetes.split(":")[0]
      : sinCorchetes;

  if (PATRON_IPV6.test(sinPuerto) && sinPuerto.includes(":")) return sinPuerto;
  return null;
}

/**
 * Lee las cabeceras de proxy habituales y devuelve datos seguros.
 *
 * `x-forwarded-for` puede contener una cadena de proxies separada por comas;
 * se toma la primera dirección, que corresponde al cliente.
 */
export function datosConexionDesde(headers: {
  get(nombre: string): string | null;
}): DatosConexion {
  const reenviada = headers.get("x-forwarded-for")?.split(",")[0] ?? null;
  const real = headers.get("x-real-ip");
  const ipAddress = normalizarIp(reenviada) ?? normalizarIp(real);

  const agente = headers.get("user-agent")?.trim() ?? null;
  const userAgent = agente ? agente.slice(0, 512) : null;

  return { ipAddress, userAgent };
}
