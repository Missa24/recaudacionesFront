"use client";

import { createContext, useContext, useMemo } from "react";
import type { ContextoSesion } from "../tipos";
import {
  descripcionRoles,
  inicialesUsuario,
  nombreCompleto,
  puedeAlguno,
  puedePermiso,
  tieneModulo,
} from "../contexto";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: SessionProvider.tsx
 *
 * Expone a los componentes cliente la sesión ya validada en el servidor.
 * Solo viaja información no sensible: identidad, roles, códigos de permiso
 * y módulos. El token y las cookies httpOnly permanecen en el servidor.
 */

interface ValorSesion {
  contexto: ContextoSesion;
  usuario: ContextoSesion["usuario"];
  nombre: string;
  iniciales: string;
  rolesTexto: string;
  esSuperusuario: boolean;
  puede: (codigoPermiso: string) => boolean;
  puedeAlguno: (codigos: readonly string[]) => boolean;
  tieneModulo: (codigoModulo: string) => boolean;
}

const SessionContext = createContext<ValorSesion | null>(null);

export function SessionProvider({
  contexto,
  children,
}: {
  contexto: ContextoSesion;
  children: React.ReactNode;
}) {
  const valor = useMemo<ValorSesion>(
    () => ({
      contexto,
      usuario: contexto.usuario,
      nombre: nombreCompleto(contexto.usuario),
      iniciales: inicialesUsuario(contexto.usuario),
      rolesTexto: descripcionRoles(contexto.roles),
      esSuperusuario: contexto.permisos.includes("*"),
      puede: (codigoPermiso) => puedePermiso(contexto, codigoPermiso),
      puedeAlguno: (codigos) => puedeAlguno(contexto, codigos),
      tieneModulo: (codigoModulo) => tieneModulo(contexto, codigoModulo),
    }),
    [contexto],
  );

  return (
    <SessionContext.Provider value={valor}>{children}</SessionContext.Provider>
  );
}

/** Hook de acceso a la sesión del cliente. */
export function useSession(): ValorSesion {
  const valor = useContext(SessionContext);
  if (!valor) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>.");
  }
  return valor;
}
