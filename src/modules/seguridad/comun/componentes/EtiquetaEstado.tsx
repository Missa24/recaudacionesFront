"use client";

import { Chip } from "@mui/material";

/**
 * Módulo: Seguridad / Común
 * Archivo: EtiquetaEstado.tsx
 *
 * Chip de estado ACTIVO/INACTIVO consistente en todas las tablas.
 */
export function EtiquetaEstado({ estado }: { estado: string }) {
  const activo = estado === "ACTIVO";
  return (
    <Chip
      size="small"
      label={activo ? "Activo" : "Inactivo"}
      color={activo ? "success" : "default"}
      variant={activo ? "filled" : "outlined"}
      sx={{ fontWeight: 600 }}
    />
  );
}
