"use client";

import { useSession } from "./SessionProvider";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: PermissionGate.tsx
 *
 * Renderiza contenido solo si el usuario tiene el permiso indicado.
 * Es una ayuda de interfaz: la autorización real se vuelve a verificar
 * en cada Server Action y en cada página.
 */
export function PermissionGate({
  permiso,
  permisos,
  children,
  fallback = null,
}: {
  /** Permiso único requerido. */
  permiso?: string;
  /** Alternativa: se permite si tiene al menos uno. */
  permisos?: readonly string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const sesion = useSession();
  const permitido = permisos
    ? sesion.puedeAlguno(permisos)
    : permiso
      ? sesion.puede(permiso)
      : true;

  return permitido ? <>{children}</> : <>{fallback}</>;
}
