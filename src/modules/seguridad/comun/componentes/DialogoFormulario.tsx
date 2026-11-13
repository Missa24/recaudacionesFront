/* eslint-disable react-hooks/set-state-in-effect -- El formulario se reinicia al abrir el diálogo con otro registro. */
"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Grid, MenuItem, TextField } from "@mui/material";
import { FormModal } from "@/common/components/FormModal";
import { LoadingButton } from "@/common/components/LoadingButton";

/**
 * Módulo: Seguridad / Común
 * Archivo: DialogoFormulario.tsx
 *
 * Diálogo de formulario genérico para altas y ediciones simples.
 * Los campos se describen con `CampoFormulario`; cada módulo decide qué
 * campos mostrar y cómo convertir los valores a su DTO.
 */

export interface CampoFormulario {
  nombre: string;
  etiqueta: string;
  requerido?: boolean;
  multiline?: boolean;
  filas?: number;
  maxLength?: number;
  tipo?: "text" | "email" | "tel";
  ayuda?: string;
}

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
  valoresIniciales: Record<string, string>;
  guardando: boolean;
  error: string | null;
  textoGuardar?: string;
  onCerrar: () => void;
  onGuardar: (valores: Record<string, string>) => Promise<void>;
}) {
  const [valores, setValores] = useState<Record<string, string>>(valoresIniciales);
  const formularioId = "formulario-seguridad";

  // Reinicia el formulario cada vez que se abre con otro registro.
  const claveValores = JSON.stringify(valoresIniciales);
  useEffect(() => {
    if (abierto) setValores(valoresIniciales);
    // `claveValores` resume los valores iniciales sin depender de su identidad.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, claveValores]);

  const cambiar = (nombre: string, valor: string) => {
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
          {campos.map((campo) => (
            <Grid
              key={campo.nombre}
              size={campo.multiline ? { xs: 12 } : { xs: 12, sm: 6 }}
            >
              <TextField
                fullWidth
                size="small"
                label={campo.etiqueta}
                type={campo.tipo ?? "text"}
                value={valores[campo.nombre] ?? ""}
                onChange={(evento) => cambiar(campo.nombre, evento.target.value)}
                required={campo.requerido}
                multiline={campo.multiline}
                rows={campo.filas ?? (campo.multiline ? 3 : undefined)}
                slotProps={{ htmlInput: { maxLength: campo.maxLength } }}
                helperText={campo.ayuda}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </FormModal>
  );
}

/** Selector de estado reutilizable para las barras de filtros. */
export function SelectorEstado({
  valor,
  onChange,
  etiqueta = "Estado",
  incluirTodos = true,
}: {
  valor: string;
  onChange: (valor: string) => void;
  etiqueta?: string;
  incluirTodos?: boolean;
}) {
  return (
    <TextField
      select
      size="small"
      label={etiqueta}
      value={valor}
      onChange={(evento) => onChange(evento.target.value)}
      sx={{ minWidth: 150 }}
    >
      {incluirTodos ? <MenuItem value="TODOS">Todos</MenuItem> : null}
      <MenuItem value="ACTIVO">Activo</MenuItem>
      <MenuItem value="INACTIVO">Inactivo</MenuItem>
    </TextField>
  );
}
