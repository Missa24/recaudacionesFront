import "server-only";

import { validarTokenEnBackend } from "./servicio-autenticacion";
import { resolverAutorizacion } from "./servicio-autorizacion";
import { actualizarContexto, construirContexto, leerSesion } from "./sesion";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: refrescar-sesion.ts
 *
 * Recalcula roles y permisos sin pedir credenciales de nuevo. Se usa
 * desde `POST /api/auth/refresh`, invocado periódicamente por el cliente
 * para reflejar cambios de roles sin obligar a cerrar sesión.
 */

/**
 * Vuelve a resolver la autorización y actualiza la cookie firmada.
 *
 * @returns `true` si la sesión sigue válida y el contexto se actualizó.
 */
export async function refrescarSesionServidor(): Promise<boolean> {
  const sesion = await leerSesion();
  if (!sesion) return false;

  const identidad = await validarTokenEnBackend(sesion.token);
  if (!identidad) return false;

  const autorizacion = await resolverAutorizacion(
    sesion.token,
    identidad.username,
  );

  const contexto = construirContexto({
    usuario: autorizacion.usuario,
    roles: autorizacion.roles,
    permisos: autorizacion.permisos,
    modulos: autorizacion.modulos,
    sesionId: sesion.contexto.sesion_id,
    expiraEn: new Date(sesion.contexto.expira_en),
  });

  await actualizarContexto(contexto);
  return true;
}
