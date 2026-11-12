"use client";

import type { ReactNode } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from "@mui/material";
import { LoadingButton } from "./LoadingButton";

interface Props {
  open: boolean;
  title?: string;
  /**
   * Texto o contenido del cuerpo. Acepta un nodo para poder mostrar un resumen
   * con jerarquía (listas, datos en columnas) en lugar de un párrafo corrido.
   */
  message: ReactNode;
  confirmLabel?: string;
  /** Color del botón de confirmación. Por defecto rojo (acción destructiva). */
  confirmColor?: "error" | "primary" | "success" | "warning";
  /** Ancho del diálogo. `xs` alcanza para un texto corto. */
  maxWidth?: "xs" | "sm" | "md";
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Diálogo de confirmación.
 *
 * Por defecto está pensado para acciones destructivas (botón rojo y ancho `xs`),
 * pero acepta cambiar el color y el ancho para confirmaciones de guardado.
 */
export function ConfirmDialog({
  open, title = "Confirmar acción", message,
  confirmLabel = "Eliminar", confirmColor = "error", maxWidth = "xs",
  loading, onCancel, onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth={maxWidth} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {typeof message === "string" ? (
          <Typography variant="body2">{message}</Typography>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} color="inherit">Cancelar</Button>
        <LoadingButton
          onClick={onConfirm}
          loading={loading}
          variant="contained"
          color={confirmColor}
        >
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}