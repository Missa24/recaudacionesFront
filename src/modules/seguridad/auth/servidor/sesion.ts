import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { COOKIE_CONTEXTO, COOKIE_TOKEN, RUTAS } from "../../comun/constantes";
import type {
  ContextoSesion,
  RolSesion,
  SesionServidor,
  UsuarioSesion,
} from "../tipos";
import type { ModuloNavegacion } from "../../modulos/tipos";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: sesion.ts
 *
 * Persistencia de la sesión en cookies httpOnly.
 *
 * Estrategia:
 * - `recaudacion_session` guarda el JWT del backend (nunca legible por JS).
 * - `recaudacion_session_contexto` guarda un JWT propio firmado con el JWT
 *   como clave HMAC. Así el contexto queda atado al token: si el token
 *   cambia o expira, el contexto deja de verificar. No se requiere un
 *   secreto adicional ni se duplica información sensible.
 *
 * Escribir cookies solo es posible en Server Actions y Route Handlers;
 * por eso las funciones de escritura no se usan desde layouts o páginas.
 */

/** Opciones homogéneas para ambas cookies. */
function opcionesCookie(expira: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expira,
  };
}

/** Clave HMAC derivada del JWT del backend. */
function claveDesdeToken(token: string): Uint8Array {
  return new TextEncoder().encode(token);
}

/** Verifica que el payload firmado tenga la forma esperada. */
function esContextoValido(valor: unknown): valor is ContextoSesion {
  if (!valor || typeof valor !== "object") return false;
  const datos = valor as Record<string, unknown>;
  if (datos.v !== 1) return false;

  const usuario = datos.usuario as Record<string, unknown> | undefined;
  if (
    !usuario ||
    typeof usuario.id !== "string" ||
    typeof usuario.username !== "string" ||
    typeof usuario.estado !== "string"
  ) {
    return false;
  }

  const rolesValidos =
    Array.isArray(datos.roles) &&
    datos.roles.every((rol) => {
      if (!rol || typeof rol !== "object") return false;
      const item = rol as Record<string, unknown>;
      return (
        typeof item.id === "string" &&
        typeof item.codigo === "string" &&
        typeof item.descripcion === "string"
      );
    });

  const permisosValidos =
    Array.isArray(datos.permisos) &&
    datos.permisos.every((permiso) => typeof permiso === "string");

  const modulosValidos =
    Array.isArray(datos.modulos) &&
    datos.modulos.every((modulo) => {
      if (!modulo || typeof modulo !== "object") return false;
      const item = modulo as Record<string, unknown>;
      return (
        typeof item.id === "string" &&
        typeof item.codigo === "string" &&
        typeof item.nombre === "string" &&
        typeof item.ruta === "string"
      );
    });

  return (
    rolesValidos &&
    permisosValidos &&
    modulosValidos &&
    (datos.sesion_id === null || typeof datos.sesion_id === "string") &&
    typeof datos.expira_en === "string" &&
    typeof datos.actualizado_en === "string"
  );
}

/** Firma el contexto con el JWT como clave y le fija la misma expiración. */
async function firmarContexto(
  contexto: ContextoSesion,
  token: string,
): Promise<string> {
  const segundosExpulsion = Math.floor(
    new Date(contexto.expira_en).getTime() / 1000,
  );

  return new SignJWT({ contexto })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(segundosExpulsion)
    .sign(claveDesdeToken(token));
}

/** Verifica la firma y la expiración del contexto. */
async function verificarContexto(
  firmado: string,
  token: string,
): Promise<ContextoSesion | null> {
  try {
    const { payload } = await jwtVerify(firmado, claveDesdeToken(token));
    const contexto = payload.contexto;
    if (!esContextoValido(contexto)) return null;
    if (new Date(contexto.expira_en).getTime() <= Date.now()) return null;
    return contexto;
  } catch {
    return null;
  }
}

/**
 * Lee la sesión actual sin redirigir.
 *
 * @returns El token y el contexto, o `null` si no hay sesión válida.
 */
export async function leerSesion(): Promise<SesionServidor | null> {
  const store = await cookies();
  const token = store.get(COOKIE_TOKEN)?.value;
  const firmado = store.get(COOKIE_CONTEXTO)?.value;
  if (!token || !firmado) return null;

  const contexto = await verificarContexto(firmado, token);
  if (!contexto) return null;

  return { token, contexto };
}

/**
 * Exige una sesión válida o redirige al login.
 *
 * Se usa al inicio de layouts, páginas y Server Actions protegidas.
 */
export async function exigirSesion(): Promise<SesionServidor> {
  const sesion = await leerSesion();
  if (!sesion) redirect(`${RUTAS.login}?motivo=sesion`);
  return sesion;
}

/** Devuelve el token de la sesión o `null`. */
export async function leerTokenSesion(): Promise<string | null> {
  return (await leerSesion())?.token ?? null;
}

/**
 * Escribe ambas cookies con el contexto recién calculado.
 *
 * @param token JWT emitido por el backend.
 * @param contexto Contexto de autorización ya resuelto.
 */
export async function guardarSesion(
  token: string,
  contexto: ContextoSesion,
): Promise<void> {
  const expira = new Date(contexto.expira_en);
  if (expira.getTime() <= Date.now()) {
    throw new Error("No se puede guardar una sesión ya expirada.");
  }

  // La cookie vive exactamente lo que el JWT emitido por el backend.
  const opciones = opcionesCookie(expira);
  const firmado = await firmarContexto(contexto, token);

  const store = await cookies();
  store.set(COOKIE_TOKEN, token, opciones);
  store.set(COOKIE_CONTEXTO, firmado, opciones);
}

/** Firma y guarda solo el contexto, conservando el token actual. */
export async function actualizarContexto(
  contexto: ContextoSesion,
): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_TOKEN)?.value;
  if (!token) return;

  const expira = new Date(contexto.expira_en);
  if (expira.getTime() <= Date.now()) return;

  store.set(COOKIE_CONTEXTO, await firmarContexto(contexto, token), {
    ...opcionesCookie(expira),
  });
}

/** Elimina ambas cookies de sesión. */
export async function borrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_TOKEN);
  store.delete(COOKIE_CONTEXTO);
}

/** Construye un contexto de sesión a partir de la autorización resuelta. */
export function construirContexto(datos: {
  usuario: UsuarioSesion;
  roles: RolSesion[];
  permisos: string[];
  modulos: ModuloNavegacion[];
  sesionId: string | null;
  expiraEn: Date;
}): ContextoSesion {
  return {
    v: 1,
    usuario: datos.usuario,
    roles: datos.roles,
    permisos: datos.permisos,
    modulos: datos.modulos,
    sesion_id: datos.sesionId,
    expira_en: datos.expiraEn.toISOString(),
    actualizado_en: new Date().toISOString(),
  };
}
