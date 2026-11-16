"use client";

import { createContext, useContext } from "react";
import type { OpcionSelect } from "@/common/crud/tipos";

/**
 * Módulo: Catálogos
 * Archivo: CatalogoOpciones.tsx
 *
 * Opciones de los catálogos relacionados (bancos y dependencias). El layout
 * las carga una vez en el servidor y las comparte con las tablas cliente,
 * evitando una consulta por fila.
 */
interface OpcionesCatalogo {
  bancos: OpcionSelect[];
  dependencias: OpcionSelect[];
}

const CatalogoOpcionesContext = createContext<OpcionesCatalogo | null>(null);

export function CatalogoOpcionesProvider({
  bancos,
  dependencias,
  children,
}: OpcionesCatalogo & { children: React.ReactNode }) {
  return (
    <CatalogoOpcionesContext.Provider value={{ bancos, dependencias }}>
      {children}
    </CatalogoOpcionesContext.Provider>
  );
}

export function useCatalogoOpciones(): OpcionesCatalogo {
  const valor = useContext(CatalogoOpcionesContext);
  if (!valor) {
    throw new Error(
      "useCatalogoOpciones debe usarse dentro de <CatalogoOpcionesProvider>.",
    );
  }
  return valor;
}
