"use client";

import { createContext, useContext } from "react";
import type { OpcionSelect } from "@/common/crud/tipos";

/**
 * Módulo: Aranceles
 * Archivo: ArancelOpciones.tsx
 *
 * Opciones de los catálogos que alimentan los formularios de aranceles.
 * El layout las carga una vez en el servidor.
 */
interface OpcionesArancel {
  dependencias: OpcionSelect[];
  cuentas: OpcionSelect[];
  tiposTramite: OpcionSelect[];
  arancelesGenerales: OpcionSelect[];
  arancelesDetalle: OpcionSelect[];
  tarifas: OpcionSelect[];
  requisitos: OpcionSelect[];
}

const ArancelOpcionesContext = createContext<OpcionesArancel | null>(null);

export function ArancelOpcionesProvider({
  children,
  ...opciones
}: OpcionesArancel & { children: React.ReactNode }) {
  return (
    <ArancelOpcionesContext.Provider value={opciones}>
      {children}
    </ArancelOpcionesContext.Provider>
  );
}

export function useArancelOpciones(): OpcionesArancel {
  const valor = useContext(ArancelOpcionesContext);
  if (!valor) {
    throw new Error(
      "useArancelOpciones debe usarse dentro de <ArancelOpcionesProvider>.",
    );
  }
  return valor;
}
