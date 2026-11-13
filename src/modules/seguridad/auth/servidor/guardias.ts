import "server-only";

import { redirect } from "next/navigation";
import { ErrorSesionExpirada } from "@/lib/http/cliente-seguridad";
import { MENSAJES, RUTAS } from "../../comun/constantes";
import { puedePermiso } from "../contexto";
import type { SesionServidor } from "../tipos";
import { exigirSesion, leerSesion } from "./sesion";

/**
 * Módulo: Seguridad / Autorización
 * Archivo: guardias.ts
 *
 * Guardias reutilizables para páginas y Server Actions.
 *
 * - Las páginas usan `exigirPermiso` / `exigirModulo`: si falta el permiso
 *   redirigen a la pantalla de acceso denegado (el usuario ya está
 *   autenticado, no tiene sentido mandarlo al login).
 * - Las acciones usan `sesionParaAccion`: lanzan un error tipado que la
 *   acción traduce a `ResultadoAccion`, sin navegar.
 */

/** Error controlado cuando una acción se ejecuta sin permiso. */
export class ErrorAccionNoPermitida extends Error {
  constructor() {
    super(MENSAJES.sinPermiso);
    this.name = "ErrorAccionNoPermitida";
  }
}

/** Redirige a la pantalla de acceso denegado indicando el permiso faltante. */
function denegar(permiso: string): never {
  redirect(`${RUTAS.denegado}?permiso=${encodeURIComponent(permiso)}`);
}

/** Exige una sesión válida para renderizar una página. */
export async function exigirSesionPagina(): Promise<SesionServidor> {
  return exigirSesion();
}

/**
 * Exige un permiso concreto para renderizar una página.
 *
 * @example
 * const { token, contexto } = await exigirPermiso(PERMISOS.usuarioVer);
 */
export async function exigirPermiso(
  codigoPermiso: string,
): Promise<SesionServidor> {
  const sesion = await exigirSesion();
  if (!puedePermiso(sesion.contexto, codigoPermiso)) denegar(codigoPermiso);
  return sesion;
}

/** Exige al menos uno de los permisos indicados. */
export async function exigirAlgunPermiso(
  codigos: readonly string[],
): Promise<SesionServidor> {
  const sesion = await exigirSesion();
  if (!codigos.some((codigo) => puedePermiso(sesion.contexto, codigo))) {
    denegar(codigos[0] ?? "GENERAL");
  }
  return sesion;
}

/** Exige acceso a un módulo (por código) para renderizar una página. */
export async function exigirModulo(
  codigoModulo: string,
): Promise<SesionServidor> {
  const sesion = await exigirSesion();
  const tieneAcceso = sesion.contexto.modulos.some(
    (modulo) => modulo.codigo === codigoModulo,
  );
  if (!tieneAcceso) denegar(codigoModulo);
  return sesion;
}

/**
 * Variante para Server Actions: no redirige, lanza errores tipados.
 *
 * @throws {ErrorAccionNoPermitida} Si el usuario no tiene el permiso.
 * @throws {ErrorSesionExpirada} Si no hay sesión (lo maneja la acción).
 */
export async function sesionParaAccion(
  codigoPermiso: string,
): Promise<SesionServidor> {
  const sesion = await leerSesion();
  if (!sesion) throw new ErrorSesionExpirada();
  if (!puedePermiso(sesion.contexto, codigoPermiso)) {
    throw new ErrorAccionNoPermitida();
  }
  return sesion;
}
