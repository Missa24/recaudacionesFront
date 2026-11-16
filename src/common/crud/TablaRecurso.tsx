"use client";

import { useMemo, useState } from "react";
import { Alert } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { DataTable } from "@/common/components/DataTable";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { useToast } from "@/common/components/ToastProvider";
import { useSession } from "@/modules/seguridad/auth/componentes/SessionProvider";
import { useListadoSeguridad } from "@/modules/seguridad/comun/hooks/useListadoSeguridad";
import type {
  ParametrosListado,
  ResultadoAccion,
  ResultadoListado,
} from "@/modules/seguridad/comun/tipos";
import { DialogoFormulario } from "./DialogoFormulario";
import type {
  CampoFormulario,
  PermisosRecurso,
  ValoresFormulario,
} from "./tipos";

/**
 * Módulo: Común / CRUD
 * Archivo: TablaRecurso.tsx
 *
 * Tabla de recurso reutilizable: listado paginado, búsqueda, alta, edición
 * y cambio de estado. Los permisos se evalúan para ocultar botones, pero
 * cada Server Action vuelve a validarlos antes de escribir.
 */
export function TablaRecurso<T extends { id: string; estado: string }>({
  cargar,
  columnas,
  campos,
  valoresIniciales,
  crear,
  actualizar,
  cambiarEstado,
  permisos,
  etiquetaCrear,
  etiquetaEntidad,
  searchPlaceholder,
  extraToolbar,
  tituloFormulario,
}: {
  cargar: (parametros: ParametrosListado) => Promise<ResultadoListado<T>>;
  columnas: GridColDef<T>[];
  campos: CampoFormulario[];
  valoresIniciales: (fila: T | null) => ValoresFormulario;
  crear: (valores: ValoresFormulario) => Promise<ResultadoAccion>;
  actualizar: (id: string, valores: ValoresFormulario) => Promise<ResultadoAccion>;
  cambiarEstado: (id: string) => Promise<ResultadoAccion>;
  permisos: PermisosRecurso;
  etiquetaCrear: string;
  etiquetaEntidad: string;
  searchPlaceholder?: string;
  extraToolbar?: React.ReactNode;
  tituloFormulario?: (fila: T | null) => string;
}) {
  const { puede } = useSession();
  const toast = useToast();
  const listado = useListadoSeguridad(cargar, {
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const [formulario, setFormulario] = useState<{
    abierto: boolean;
    fila: T | null;
  }>({ abierto: false, fila: null });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const [porCambiarEstado, setPorCambiarEstado] = useState<T | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const columnasConAcciones = useMemo<GridColDef<T>[]>(
    () => [
      ...columnas,
      {
        field: "acciones",
        type: "actions",
        headerName: "Acciones",
        width: 100,
        sortable: false,
        filterable: false,
        getActions: (parametros) => {
          const acciones = [];
          if (puede(permisos.editar)) {
            acciones.push(
              <GridActionsCellItem
                key="editar"
                icon={<EditOutlinedIcon />}
                label="Editar"
                onClick={() => {
                  setErrorFormulario(null);
                  setFormulario({ abierto: true, fila: parametros.row });
                }}
              />,
            );
          }
          if (puede(permisos.estado)) {
            acciones.push(
              <GridActionsCellItem
                key="estado"
                icon={
                  parametros.row.estado === "ACTIVO" ? (
                    <BlockOutlinedIcon />
                  ) : (
                    <CheckCircleOutlineOutlinedIcon />
                  )
                }
                label={
                  parametros.row.estado === "ACTIVO" ? "Desactivar" : "Activar"
                }
                onClick={() => setPorCambiarEstado(parametros.row)}
              />,
            );
          }
          return acciones;
        },
      },
    ],
    [columnas, permisos.editar, permisos.estado, puede],
  );

  const guardar = async (valores: ValoresFormulario) => {
    setGuardando(true);
    setErrorFormulario(null);
    const resultado = formulario.fila
      ? await actualizar(formulario.fila.id, valores)
      : await crear(valores);
    setGuardando(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setFormulario({ abierto: false, fila: null });
      listado.recargar();
    } else {
      setErrorFormulario(resultado.mensaje);
    }
  };

  const confirmarEstado = async () => {
    if (!porCambiarEstado) return;
    setCambiandoEstado(true);
    const resultado = await cambiarEstado(porCambiarEstado.id);
    setCambiandoEstado(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setPorCambiarEstado(null);
      listado.recargar();
    } else {
      toast.error(resultado.mensaje);
    }
  };

  const titulo =
    tituloFormulario?.(formulario.fila) ??
    (formulario.fila ? `Editar ${etiquetaEntidad}` : `Nuevo ${etiquetaEntidad}`);

  return (
    <>
      {listado.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {listado.error}
        </Alert>
      ) : null}

      <DataTable<T>
        rows={listado.filas}
        columns={columnasConAcciones}
        loading={listado.cargando}
        meta={listado.paginacion}
        search={listado.busqueda}
        onSearchChange={listado.setBusqueda}
        searchPlaceholder={searchPlaceholder ?? "Buscar…"}
        onPaginationChange={listado.cambiarPagina}
        onSortChange={(modelo) =>
          listado.cambiarOrden(
            modelo[0]?.field,
            modelo[0]?.sort === "asc" ? "ASC" : "DESC",
          )
        }
        onCreate={
          puede(permisos.crear)
            ? () => {
                setErrorFormulario(null);
                setFormulario({ abierto: true, fila: null });
              }
            : undefined
        }
        createLabel={etiquetaCrear}
        extraToolbar={extraToolbar}
      />

      <DialogoFormulario
        abierto={formulario.abierto}
        titulo={titulo}
        campos={campos}
        valoresIniciales={valoresIniciales(formulario.fila)}
        guardando={guardando}
        error={errorFormulario}
        textoGuardar={formulario.fila ? "Guardar cambios" : "Registrar"}
        onCerrar={() => {
          if (!guardando) setFormulario({ abierto: false, fila: null });
        }}
        onGuardar={guardar}
      />

      <ConfirmDialog
        open={porCambiarEstado !== null}
        title={
          porCambiarEstado?.estado === "ACTIVO"
            ? `Desactivar ${etiquetaEntidad}`
            : `Activar ${etiquetaEntidad}`
        }
        message={
          porCambiarEstado
            ? `¿Confirmas ${
                porCambiarEstado.estado === "ACTIVO" ? "desactivar" : "activar"
              } este registro?`
            : ""
        }
        confirmLabel={
          porCambiarEstado?.estado === "ACTIVO" ? "Desactivar" : "Activar"
        }
        confirmColor={
          porCambiarEstado?.estado === "ACTIVO" ? "error" : "success"
        }
        loading={cambiandoEstado}
        onCancel={() => setPorCambiarEstado(null)}
        onConfirm={confirmarEstado}
      />
    </>
  );
}
