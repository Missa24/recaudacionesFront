/* eslint-disable react-hooks/set-state-in-effect -- La carga se inicia al abrir el diálogo y el estado de carga se refleja de inmediato. */
"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { FormModal } from "@/common/components/FormModal";
import { LoadingButton } from "@/common/components/LoadingButton";
import { Button } from "@mui/material";
import { useToast } from "@/common/components/ToastProvider";
import type { UsuarioSeguridad } from "../tipos";
import {
  guardarRolesDeUsuarioAction,
  listarRolesDisponiblesAction,
  obtenerRolesDeUsuarioAction,
} from "../acciones";

/**
 * Módulo: Seguridad / Usuarios
 * Archivo: DialogoRolesUsuario.tsx
 *
 * Asigna y retira roles de un usuario mediante diferencial:
 * - roles marcados que no tenía → se asignan,
 * - roles desmarcados que tenía → se desactivan.
 */
export function DialogoRolesUsuario({
  usuario,
  abierto,
  onCerrar,
  onGuardado,
}: {
  usuario: UsuarioSeguridad | null;
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const toast = useToast();
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opciones, setOpciones] = useState<
    Array<{ id: string; codigo: string; descripcion: string }>
  >([]);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [originales, setOriginales] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!abierto || !usuario) return;
    let vigente = true;
    setCargando(true);
    setError(null);

    Promise.all([
      obtenerRolesDeUsuarioAction(usuario.id),
      listarRolesDisponiblesAction(),
    ])
      .then(([actuales, disponibles]) => {
        if (!vigente) return;
        if (!actuales.ok) {
          setError(actuales.mensaje);
          return;
        }
        if (!disponibles.ok) {
          setError(disponibles.mensaje);
          return;
        }

        const mapa = new Map<
          string,
          { id: string; codigo: string; descripcion: string }
        >();
        for (const rol of disponibles.roles) mapa.set(rol.id, rol);
        // Un rol activo del usuario podría ya no estar en el catálogo activo.
        for (const rol of actuales.roles) {
          if (!mapa.has(rol.id)) mapa.set(rol.id, rol);
        }

        const ids = new Set(actuales.roles.map((rol) => rol.id));
        setOpciones(
          [...mapa.values()].sort((a, b) => a.codigo.localeCompare(b.codigo, "es")),
        );
        setSeleccion(new Set(ids));
        setOriginales(new Set(ids));
      })
      .catch(() => {
        if (vigente) setError("No se pudieron cargar los roles del usuario.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, usuario]);

  const alternar = (rolId: string) => {
    setSeleccion((previos) => {
      const siguiente = new Set(previos);
      if (siguiente.has(rolId)) siguiente.delete(rolId);
      else siguiente.add(rolId);
      return siguiente;
    });
  };

  const guardar = async () => {
    if (!usuario) return;
    const agregar = [...seleccion].filter((id) => !originales.has(id));
    const quitar = [...originales].filter((id) => !seleccion.has(id));

    setGuardando(true);
    setError(null);
    const resultado = await guardarRolesDeUsuarioAction(
      usuario.id,
      agregar,
      quitar,
    );
    setGuardando(false);

    if (resultado.ok) {
      toast.success(resultado.mensaje);
      onGuardado();
      onCerrar();
    } else {
      setError(resultado.mensaje);
    }
  };

  return (
    <FormModal
      open={abierto}
      title={`Roles de ${usuario?.username ?? "usuario"}`}
      onClose={onCerrar}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onCerrar} color="inherit" disabled={guardando}>
            Cancelar
          </Button>
          <LoadingButton
            onClick={guardar}
            variant="contained"
            loading={guardando}
            disabled={cargando}
          >
            Guardar roles
          </LoadingButton>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Los permisos efectivos del usuario son la unión de los permisos de sus
        roles activos.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : opciones.length === 0 ? (
        <Alert severity="info">
          No hay roles activos disponibles. Crea roles y asígnales permisos
          primero.
        </Alert>
      ) : (
        <Stack sx={{ gap: 0.5, maxHeight: 360, overflowY: "auto" }}>
          {opciones.map((rol) => (
            <FormControlLabel
              key={rol.id}
              control={
                <Checkbox
                  checked={seleccion.has(rol.id)}
                  onChange={() => alternar(rol.id)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {rol.codigo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rol.descripcion}
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", m: 0, p: 1, borderRadius: 1 }}
            />
          ))}
        </Stack>
      )}
    </FormModal>
  );
}
