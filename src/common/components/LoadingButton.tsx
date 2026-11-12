"use client";

import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface Props extends ButtonProps {
  loading?: boolean;
}

/** Botón con spinner integrado y tamaño estable mientras carga. */
export function LoadingButton({ loading, children, disabled, ...rest }: Props) {
  return (
    <Button {...rest} disabled={loading || disabled}>
      {loading ? <CircularProgress size={18} color="inherit" /> : children}
    </Button>
  );
}