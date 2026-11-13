"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { datosConexionDesde } from "@/lib/http/conexion";
import { MENSAJES, RUTAS } from "../comun/constantes";
import type { ResultadoLogin } from "./tipos";
import { mensajeSeguro } from "./servidor/errores";
import {
  cerrarSesionEnBackend,
  iniciarSesionEnBackend,
  registrarSesionEnBackend,
} from "./servidor/servicio-autenticacion";
import {
  ErrorUsuarioSinAcceso,
  resolverAutorizacion,
} from "./servidor/servicio-autorizacion";
import {
  borrarSesion,
  construirContexto,
  guardarSesion,
  leerSesion,
} from "./servidor/sesion";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: acciones.ts
 *
 * Server Actions del ciclo de sesión. Son el único punto donde el
 * navegador puede iniciar o cerrar sesión; el JWT y las cookies httpOnly
 * nunca salen del servidor.
 */

/** Valida que el destino sea una ruta interna y segura para redirigir. */
function destinoSeguro(destino: string | undefined): string {
  if (!destino) return RUTAS.inicio;
  if (!destino.startsWith("/") || destino.startsWith("//")) return RUTAS.inicio;
  if (destino.startsWith("/login") || destino.startsWith("/api")) {
    return RUTAS.inicio;
  }
  return destino;
}

/**
 * Inicia sesión contra el backend y persiste la cookie httpOnly.
 *
 * Pasos:
 * 1. Autentica credenciales (LDAP vía NestJS).
 * 2. Resuelve usuario, roles, permisos y módulos desde el esquema `seguridad`.
 * 3. Registra la fila en `seguridad.sesion` con IP y user-agent (best-effort).
 * 4. Firma el contexto y escribe las cookies.
 *
 * @param username Usuario institucional.
 * @param password Contraseña (nunca se registra ni se devuelve).
 * @param destino Ruta interna a la que volver después del login.
 */
export async function iniciarSesionAction(
  username: string,
  password: string,
  destino?: string,
): Promise<ResultadoLogin> {
  const usuarioNormalizado = username.trim();
  if (!usuarioNormalizado || !password) {
    return {
      ok: false,
      mensaje: "Completa el usuario y la contraseña.",
    };
  }

  try {
    const sesionBackend = await iniciarSesionEnBackend(
      usuarioNormalizado,
      password,
    );
    if (!sesionBackend) {
      return { ok: false, mensaje: MENSAJES.credenciales };
    }

    const autorizacion = await resolverAutorizacion(
      sesionBackend.token,
      sesionBackend.usuario.username,
    );

    const datosConexion = datosConexionDesde(await headers());
    const sesionId = await registrarSesionEnBackend(
      sesionBackend.token,
      datosConexion,
    );

    const contexto = construirContexto({
      usuario: autorizacion.usuario,
      roles: autorizacion.roles,
      permisos: autorizacion.permisos,
      modulos: autorizacion.modulos,
      sesionId,
      expiraEn: sesionBackend.expiraEn,
    });

    await guardarSesion(sesionBackend.token, contexto);

    return { ok: true, redireccion: destinoSeguro(destino) };
  } catch (error) {
    if (error instanceof ErrorUsuarioSinAcceso) {
      return { ok: false, mensaje: MENSAJES.sinAcceso };
    }
    return { ok: false, mensaje: mensajeSeguro(error) };
  }
}

/**
 * Cierra la sesión en el backend (si se registró) y elimina las cookies.
 * Funciona como `action` de un `<form>`, por lo que redirige al login.
 */
export async function cerrarSesionAction(): Promise<void> {
  const sesion = await leerSesion();

  if (sesion?.contexto.sesion_id) {
    await cerrarSesionEnBackend(sesion.token, sesion.contexto.sesion_id);
  }

  await borrarSesion();
  redirect(`${RUTAS.login}?motivo=salida`);
}
