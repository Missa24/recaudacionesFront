import "server-only";

import {
  ErrorApiSeguridad,
  ErrorServicioSeguridad,
  ErrorSesionExpirada,
} from "@/lib/http/cliente-seguridad";
import { MENSAJES } from "../../comun/constantes";
import { ErrorAccionNoPermitida } from "../servidor/guardias";

/**
 * Módulo: Seguridad / Infraestructura
 * Archivo: errores.ts
 *
 * Traduce errores internos a mensajes seguros para el usuario. Ningún
 * mensaje incluye rutas, SQL, nombres de tablas ni el cuerpo del backend.
 */

/** Convierte cualquier error en un texto apto para la interfaz. */
export function mensajeSeguro(error: unknown): string {
  if (error instanceof ErrorAccionNoPermitida) return MENSAJES.sinPermiso;
  if (error instanceof ErrorSesionExpirada) return MENSAJES.sesionExpirada;
  if (error instanceof ErrorApiSeguridad) {
    // 401/403 nunca deben revelar el motivo exacto del backend.
    if ([401, 403].includes(error.estado)) return MENSAJES.sinPermiso;
    return error.mensajeUsuario;
  }
  if (error instanceof ErrorServicioSeguridad) return MENSAJES.servicio;
  return MENSAJES.inesperado;
}
