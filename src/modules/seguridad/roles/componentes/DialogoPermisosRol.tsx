/* eslint-disable react-hooks/set-state-in-effect -- La carga se inicia al abrir el diálogo y el estado de carga se refleja de inmediato. */
"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { FormModal } from "@/common/components/FormModal";
import { LoadingButton } from "@/common/components/LoadingButton";
import { useToast } from "@/common/components/ToastProvider";
import type { CatalogoPermisos, MatrizPermisos, RolSeguridad } from "../tipos";
import {
  guardarPermisosRolAction,
  obtenerPermisosRolAction,
  type CambioPermisosModulo,
} from "../acciones";

/**
 * Módulo: Seguridad / Roles
 * Archivo: DialogoPermisosRol.tsx
 *
 * Editor de la matriz rol–módulo–permiso. Por cada módulo se elige el
 * conjunto de permisos; al guardar solo se envían los módulos modificados.
 */

/** Compara dos listas de IDs sin importar el orden. */
function mismosIds(izquierda: string[], derecha: string[]): boolean {
  if (izquierda.length !== derecha.length) return false;
  const conjunto = new Set(izquierda);
  return derecha.every((id) => conjunto.has(id));
}

export function DialogoPermisosRol({
  rol,
  abierto,
  onCerrar,
  onGuardado,
}: {
  rol: RolSeguridad | null;
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const toast = useToast();
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoPermisos | null>(null);
  const [matriz, setMatriz] = useState<MatrizPermisos>({});
  const [original, setOriginal] = useState<MatrizPermisos>({});

  useEffect(() => {
    if (!abierto || !rol) return;
    let vigente = true;
    setCargando(true);
    setError(null);

    obtenerPermisosRolAction(rol.id)
      .then((resultado) => {
        if (!vigente) return;
        if (!resultado.ok) {
          setError(resultado.mensaje);
          return;
        }
        setCatalogo(resultado.catalogo);
        setMatriz(resultado.matriz);
        setOriginal(
          Object.fromEntries(
            Object.entries(resultado.matriz).map(([modulo, permisos]) => [
              modulo,
              [...permisos],
            ]),
          ),
        );
      })
      .catch(() => {
        if (vigente) setError("No se pudieron cargar los permisos del rol.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, rol]);

  const cambiarModulo = (moduloId: string, permisos: string[]) => {
    setMatriz((previos) => ({ ...previos, [moduloId]: permisos }));
  };

  const guardar = async () => {
    if (!rol || !catalogo) return;

    const cambios: CambioPermisosModulo[] = catalogo.modulos
      .filter(
        (modulo) => !mismosIds(original[modulo.id] ?? [], matriz[modulo.id] ?? []),
      )
      .map((modulo) => ({
        moduloId: modulo.id,
        permisos: matriz[modulo.id] ?? [],
      }));

    setGuardando(true);
    setError(null);
    const resultado = await guardarPermisosRolAction(rol.id, cambios);
    setGuardando(false);

    if (resultado.ok) {
      toast.success(resultado.mensaje);
      onGuardado();
      onCerrar();
    } else {
      setError(resultado.mensaje);
    }
  };

  const sinDatos =
    !cargando &&
    catalogo !== null &&
    (catalogo.modulos.length === 0 || catalogo.permisos.length === 0);

  return (
    <FormModal
      open={abierto}
      title={`Permisos de ${rol?.codigo ?? "rol"}`}
      onClose={onCerrar}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onCerrar} color="inherit" disabled={guardando}>
            Cancelar
          </Button>
          <LoadingButton
            onClick={guardar}
            variant="contained"
            loading={guardando}
            disabled={cargando || sinDatos}
          >
            Guardar permisos
          </LoadingButton>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Marca los permisos que tendrá este rol en cada módulo. Un módulo sin
        permisos deja de ser visible para el rol.
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
      ) : sinDatos ? (
        <Alert severity="info">
          Primero registra módulos y permisos en el catálogo para poder
          asignarlos a un rol.
        </Alert>
      ) : (
        <Stack divider={<Divider />} sx={{ gap: 2 }}>
          {catalogo?.modulos.map((modulo) => (
            <Box key={modulo.id}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {modulo.nombre}{" "}
                <Typography component="span" variant="caption" color="text.secondary">
                  ({modulo.codigo} · {modulo.ruta})
                </Typography>
              </Typography>

              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id={`permisos-${modulo.id}`}>Permisos</InputLabel>
                <Select
                  multiple
                  labelId={`permisos-${modulo.id}`}
                  label="Permisos"
                  value={matriz[modulo.id] ?? []}
                  onChange={(evento) => {
                    const valor = evento.target.value;
                    cambiarModulo(
                      modulo.id,
                      typeof valor === "string" ? valor.split(",") : valor,
                    );
                  }}
                  input={<OutlinedInput label="Permisos" />}
                  renderValue={(seleccionados) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {seleccionados.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Sin permisos
                        </Typography>
                      ) : (
                        seleccionados.map((permisoId) => {
                          const permiso = catalogo?.permisos.find(
                            (item) => item.id === permisoId,
                          );
                          return (
                            <Chip
                              key={permisoId}
                              size="small"
                              label={permiso?.codigo ?? permisoId}
                            />
                          );
                        })
                      )}
                    </Box>
                  )}
                >
                  {catalogo?.permisos.map((permiso) => (
                    <MenuItem key={permiso.id} value={permiso.id}>
                      <Checkbox
                        size="small"
                        checked={(matriz[modulo.id] ?? []).includes(permiso.id)}
                      />
                      <ListItemText
                        primary={permiso.codigo}
                        secondary={permiso.descripcion}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ))}
        </Stack>
      )}
    </FormModal>
  );
}
