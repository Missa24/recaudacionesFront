/* eslint-disable react-hooks/set-state-in-effect -- El formulario se reinicia al abrirse con otro registro. */
"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { FormModal } from "@/common/components/FormModal";
import { LoadingButton } from "@/common/components/LoadingButton";
import type {
  CampoFormulario,
  ValorFormulario,
  ValoresFormulario,
} from "./tipos";

/**
 * Módulo: Común / CRUD
 * Archivo: DialogoFormulario.tsx
 *
 * Formulario genérico para altas y ediciones de catálogos. Soporta texto,
 * correo, teléfono, número, fecha, booleano, select y texto multilínea.
 */
export function DialogoFormulario({
  abierto,
  titulo,
  campos,
  valoresIniciales,
  guardando,
  error,
  textoGuardar = "Guardar",
  onCerrar,
  onGuardar,
}: {
  abierto: boolean;
  titulo: string;
  campos: CampoFormulario[];
  valoresIniciales: ValoresFormulario;
  guardando: boolean;
  error: string | null;
  textoGuardar?: string;
  onCerrar: () => void;
  onGuardar: (valores: ValoresFormulario) => Promise<void>;
}) {
  const [valores, setValores] = useState<ValoresFormulario>(valoresIniciales);
  const formularioId = "formulario-recurso";
  const claveValores = JSON.stringify(valoresIniciales);

  useEffect(() => {
    if (abierto) setValores(valoresIniciales);
    // `claveValores` resume los valores sin depender de su identidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, claveValores]);

  const cambiar = (nombre: string, valor: ValorFormulario) => {
    setValores((previos) => ({ ...previos, [nombre]: valor }));
  };

  return (
    <FormModal
      open={abierto}
      title={titulo}
      onClose={onCerrar}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onCerrar} color="inherit" disabled={guardando}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            form={formularioId}
            variant="contained"
            loading={guardando}
          >
            {textoGuardar}
          </LoadingButton>
        </>
      }
    >
      <Box
        id={formularioId}
        component="form"
        onSubmit={async (evento) => {
          evento.preventDefault();
          await onGuardar(valores);
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          {campos.map((campo) => {
            const valor = valores[campo.nombre];
            const ancho = campo.ancho ?? (campo.tipo === "multiline" || campo.tipo === "boolean" ? 12 : 6);

            if (campo.tipo === "boolean") {
              return (
                <Grid key={campo.nombre} size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={valor === true}
                        onChange={(evento) =>
                          cambiar(campo.nombre, evento.target.checked)
                        }
                      />
                    }
                    label={campo.etiqueta}
                  />
                  {campo.ayuda ? (
                    <Box sx={{ color: "text.secondary", fontSize: 12, ml: 4 }}>
                      {campo.ayuda}
                    </Box>
                  ) : null}
                </Grid>
              );
            }

            if (campo.tipo === "select") {
              return (
                <Grid key={campo.nombre} size={{ xs: 12, sm: ancho }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={campo.etiqueta}
                    value={typeof valor === "string" ? valor : ""}
                    onChange={(evento) =>
                      cambiar(campo.nombre, evento.target.value)
                    }
                    required={campo.requerido}
                    helperText={campo.ayuda}
                  >
                    <MenuItem value="">
                      <em>Sin seleccionar</em>
                    </MenuItem>
                    {(campo.opciones ?? []).map((opcion) => (
                      <MenuItem key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              );
            }

            return (
              <Grid key={campo.nombre} size={{ xs: 12, sm: ancho }}>
                <TextField
                  fullWidth
                  size="small"
                  label={campo.etiqueta}
                  type={campo.tipo ?? "text"}
                  value={typeof valor === "string" ? valor : ""}
                  onChange={(evento) =>
                    cambiar(campo.nombre, evento.target.value)
                  }
                  required={campo.requerido}
                  multiline={campo.tipo === "multiline"}
                  rows={campo.tipo === "multiline" ? 3 : undefined}
                  slotProps={{
                    htmlInput: {
                      maxLength: campo.maxLength,
                      min: campo.min,
                      max: campo.max,
                      step: campo.step,
                    },
                  }}
                  helperText={campo.ayuda}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </FormModal>
  );
}
