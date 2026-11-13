import type { Metadata } from "next";
import { AppProviders } from "@/theme/providers";

export const metadata: Metadata = {
  title: "Sistema de Recaudaciones | Gobierno Autónomo Departamental de La Paz",
  description:
    "Plataforma institucional para la gestión y seguimiento de las recaudaciones del Gobierno Autónomo Departamental de La Paz.",
};

/**
 * Layout raíz. Solo monta los proveedores de tema y notificaciones: la
 * sesión se resuelve en el layout autenticado y el login, no aquí.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
