"use client";

import type { TextFieldProps } from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface DateFieldProps extends Pick<
  TextFieldProps,
  "disabled" | "error" | "helperText" | "inputRef" | "label" | "name" | "sx"
> {
  /** Fecha en formato `YYYY-MM-DD` (cadena vacía si no hay valor). */
  value: string;
  /** Devuelve la fecha elegida en `YYYY-MM-DD`, o `""` si se limpió. */
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Fecha mínima seleccionable, en `YYYY-MM-DD`. */
  minDate?: string;
  /** Fecha máxima seleccionable, en `YYYY-MM-DD`. */
  maxDate?: string;
  fullWidth?: boolean;
  size?: "small" | "medium";
}

export function DateField({
  value,
  onChange,
  onBlur,
  minDate,
  maxDate,
  fullWidth = true,
  size = "medium",
  ...props
}: DateFieldProps) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(date) =>
        onChange(date?.isValid() ? date.format("YYYY-MM-DD") : "")
      }
      format="DD/MM/YYYY"
      minDate={minDate ? dayjs(minDate) : undefined}
      maxDate={maxDate ? dayjs(maxDate) : undefined}
      slotProps={{
        field: { onBlur },
        textField: {
          ...props,
          fullWidth,
          size,
        },
      }}
    />
  );
}