"use client";

import { useState } from "react";
import { InputAdornment, TextField, TextFieldProps } from "@mui/material";
import { formatearMonto, parsearMonto } from "../lib/money";

type Props = Omit<TextFieldProps, "value" | "onChange" | "type" | "select"> & {
  value?: number | null;
  onValueChange: (valor: number | null) => void;
  moneda?: string;
  min?: number;
  max?: number;
};

/**
 * Campo de monto.
 *
 * Mientras se escribe se respeta el texto tal cual; al salir del campo se
 * interpreta (`1.234,56`, `1234,56`, `1234.56` o `1234`), se valida el rango y
 * se vuelve a formatear. Está pensado para usarse con `Controller` de
 * react-hook-form, por eso notifica el número y no un evento.
 */
export function CurrencyField({
  value,
  onValueChange,
  moneda = "Bs",
  min,
  max,
  helperText,
  error,
  ...resto
}: Props) {
  const [texto, setTexto] = useState(() => formatearMonto(value));
  const [valorSincronizado, setValorSincronizado] = useState<number | null>(
    value ?? null,
  );
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Si el formulario cambia el valor desde afuera (un reset, o el valor que se
  // cargó al editar), el texto se rearma. Se ajusta durante el render, sin
  // efectos, que es el patrón recomendado por React para esto.
  if ((value ?? null) !== valorSincronizado) {
    setValorSincronizado(value ?? null);
    setTexto(formatearMonto(value));
    setErrorLocal(null);
  }

  const confirmar = () => {
    if (texto.trim() === "") {
      setErrorLocal(null);
      setValorSincronizado(null);
      onValueChange(null);
      return;
    }

    const numero = parsearMonto(texto);
    if (numero === null) {
      setErrorLocal("Monto inválido");
      return;
    }
    if (min !== undefined && numero < min) {
      setErrorLocal(`El monto no puede ser menor a ${formatearMonto(min)}`);
      return;
    }
    if (max !== undefined && numero > max) {
      setErrorLocal(`El monto no puede superar ${formatearMonto(max)}`);
      return;
    }

    setErrorLocal(null);
    onValueChange(numero);
    setValorSincronizado(numero);
    setTexto(formatearMonto(numero));
  };

  return (
    <TextField
      {...resto}
      value={texto}
      onChange={(evento) => setTexto(evento.target.value)}
      onBlur={confirmar}
      error={error || Boolean(errorLocal)}
      helperText={errorLocal ?? helperText}
      slotProps={{
        htmlInput: {
          inputMode: "decimal",
          style: {
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          },
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">{moneda}</InputAdornment>
          ),
        },
      }}
    />
  );
}
