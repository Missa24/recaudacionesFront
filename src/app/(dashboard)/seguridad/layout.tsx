import { redirect } from "next/navigation";
import { MODULOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";

/**
 * Módulo: Seguridad / Layout
 * Archivo: (dashboard)/seguridad/layout.tsx
 *
 * Puerta de entrada al área de seguridad. Si el usuario no tiene ningún
 * módulo de seguridad (ni es superusuario), se lo redirige a la pantalla
 * de acceso denegado. Cada página vuelve a exigir su permiso específico.
 */
export const instant = false;

const MODULOS_SEGURIDAD: string[] = [
  MODULOS.usuarios,
  MODULOS.roles,
  MODULOS.modulos,
  MODULOS.permisos,
  MODULOS.sesiones,
];

export default async function SeguridadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { contexto } = await exigirSesion();

  const permitido =
    contexto.permisos.includes("*") ||
    contexto.modulos.some((modulo) =>
      MODULOS_SEGURIDAD.includes(modulo.codigo),
    );

  if (!permitido) redirect(RUTAS.denegado);

  return <>{children}</>;
}
