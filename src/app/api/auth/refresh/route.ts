import { NextResponse } from "next/server";
import { refrescarSesionServidor } from "@/modules/seguridad/auth/servidor/refrescar-sesion";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: api/auth/refresh/route.ts
 *
 * Route Handler que recalcula roles y permisos y reescribe la cookie
 * firmada. Lo llama el cliente cada cinco minutos para reflejar cambios
 * de autorización sin obligar al usuario a volver a iniciar sesión.
 *
 * Devuelve 401 si la sesión ya no es válida; el cliente redirige al login.
 */
export async function POST() {
  try {
    const actualizada = await refrescarSesionServidor();
    if (!actualizada) {
      return NextResponse.json(
        { ok: false, mensaje: "Sesión no válida." },
        { status: 401 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, mensaje: "No se pudo actualizar la sesión." },
      { status: 401 },
    );
  }
}
