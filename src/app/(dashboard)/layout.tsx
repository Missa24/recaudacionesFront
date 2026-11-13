import { ApplicationShell } from "./application-shell";
import { SessionProvider } from "@/modules/seguridad/auth/componentes/SessionProvider";
import { SessionExpiryGuard } from "@/modules/seguridad/auth/componentes/SessionExpiryGuard";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";

/**
 * Módulo: Seguridad / Shell
 * Archivo: (dashboard)/layout.tsx
 *
 * Layout de la aplicación autenticada. Valida la sesión en el servidor y
 * entrega a la interfaz solo el contexto no sensible. El token permanece
 * en una cookie httpOnly.
 *
 * `instant = false` permite que el segmento bloquee en el servidor mientras
 * se lee la cookie; sin esto, Cache Components exigiría envolver toda la
 * lectura en Suspense.
 */
export const instant = false;

export default async function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { contexto } = await exigirSesion();

  return (
    <SessionProvider contexto={contexto}>
      <SessionExpiryGuard expiraEn={contexto.expira_en} />
      <ApplicationShell modulos={contexto.modulos}>{children}</ApplicationShell>
    </SessionProvider>
  );
}
