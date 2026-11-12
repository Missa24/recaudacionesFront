"use client";

import { Typography, TypographyProps } from "@mui/material";
import { formatearMonto, formatearMontoConMoneda } from "../lib/money";

interface Props extends Omit<TypographyProps, "children"> {
  valor?: number | string | null;
  /** Muestra el prefijo de moneda (por defecto solo el número). */
  conMoneda?: boolean;
  moneda?: string;
}

/**
 * Monto formateado en un solo lugar. Los dígitos usan ancho tabular para que
 * las columnas de importes queden alineadas.
 */
export function CurrencyText({
  valor,
  conMoneda = false,
  moneda = "Bs",
  sx,
  ...resto
}: Props) {
  const texto = conMoneda
    ? formatearMontoConMoneda(valor, moneda)
    : formatearMonto(valor);

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{ fontVariantNumeric: "tabular-nums", ...sx }}
      {...resto}
    >
      {texto || "—"}
    </Typography>
  );
}
