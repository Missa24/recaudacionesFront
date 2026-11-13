import "server-only";

import { revalidatePath } from "next/cache";
import type { ResultadoAccion } from "../../comun/tipos";
import { mensajeSeguro } from "./errores";
import { sesionParaAccion } from "./guardias";
import type { SesionServidor } from "../tipos";

/**
 * Módulo: Seguridad / Infraestructura
 * Archivo: accion-protegida.ts
 *
 * Envoltorio común de las Server Actions de escritura:
 * 1. verifica el permiso antes de tocar el backend,
 * 2. ejecuta la operación,
 * 3. revalida las rutas afectadas,
 * 4. devuelve un `ResultadoAccion` sin lanzar errores de negocio.
 */

/**
 * Ejecuta una acción protegida.
 *
 * @param permiso Código de permiso requerido.
 * @param tarea Operación de escritura; devuelve el mensaje de éxito.
 * @param rutas Rutas a revalidar después de la escritura.
 */
export async function ejecutarAccion(
  permiso: string,
  tarea: (sesion: SesionServidor) => Promise<string>,
  rutas: readonly string[],
): Promise<ResultadoAccion> {
  try {
    const sesion = await sesionParaAccion(permiso);
    const mensaje = await tarea(sesion);
    for (const ruta of rutas) revalidatePath(ruta);
    return { ok: true, mensaje };
  } catch (error) {
    return { ok: false, mensaje: mensajeSeguro(error) };
  }
}

/**
 * Ejecuta una lectura protegida para tablas cliente.
 * No revalida rutas: es una consulta.
 */
export async function ejecutarLectura<T>(
  permiso: string,
  tarea: (sesion: SesionServidor) => Promise<T>,
): Promise<{ ok: true; datos: T } | { ok: false; mensaje: string }> {
  try {
    const sesion = await sesionParaAccion(permiso);
    return { ok: true, datos: await tarea(sesion) };
  } catch (error) {
    return { ok: false, mensaje: mensajeSeguro(error) };
  }
}
