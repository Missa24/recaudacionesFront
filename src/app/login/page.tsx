import { redirect } from "next/navigation";
import { leerSesion } from "@/modules/seguridad/auth/servidor/sesion";
import { LoginForm } from "./login-form";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: login/page.tsx
 *
 * Página de acceso. Si ya hay una sesión válida redirige al inicio; si no,
 * entrega al formulario el destino solicitado (`?next=`) y el motivo de la
 * redirección (`?motivo=`).
 */
export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; motivo?: string }>;
}) {
  if (await leerSesion()) redirect("/");

  const parametros = await searchParams;
  return <LoginForm destino={parametros.next} motivo={parametros.motivo} />;
}
