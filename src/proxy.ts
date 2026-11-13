import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_CONTEXTO,
  COOKIE_TOKEN,
  RUTAS,
} from "@/modules/seguridad/comun/constantes";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: proxy.ts
 *
 * Proxy de Next.js 16 (antes middleware). Hace una comprobación optimista:
 * si no hay cookies de sesión, manda al login conservando la ruta pedida.
 *
 * No valida la firma ni consulta permisos: eso lo hacen el layout y cada
 * página en el servidor. La documentación de Next recomienda no usar el
 * proxy como solución completa de autorización.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // El login siempre es accesible; la página decide si ya hay sesión.
  if (pathname === RUTAS.login) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_TOKEN)?.value;
  const contexto = request.cookies.get(COOKIE_CONTEXTO)?.value;

  if (!token || !contexto) {
    const login = new URL(RUTAS.login, request.url);
    login.searchParams.set("motivo", "sesion");
    if (pathname !== RUTAS.inicio) {
      login.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|logo-gadlp.png|.*\\..*).*)"],
};
