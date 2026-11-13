"use client";

import { useMemo, useState } from "react";
import { Alert, Stack } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { DataTable } from "@/common/components/DataTable";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { useToast } from "@/common/components/ToastProvider";
import { PERMISOS } from "../../comun/constantes";
import { useSession } from "../../auth/componentes/SessionProvider";
import { useListadoSeguridad } from "../../comun/hooks/useListadoSeguridad";
import { EtiquetaEstado } from "../../comun/componentes/EtiquetaEstado";
import {
  DialogoFormulario,
  SelectorEstado,
  type CampoFormulario,
} from "../../comun/componentes/DialogoFormulario";
import type { PermisoSeguridad } from "../tipos";
import {
  actualizarPermisoAction,
  cambiarEstadoPermisoAction,
  crearPermisoAction,
  listarPermisosAction,
} from "../acciones";

/**
 * Módulo: Seguridad / Permisos
 * Archivo: TablaPermisos.tsx
 *
 * Catálogo de permisos funcionales que después se asignan a roles.
 */

const CAMPOS: CampoFormulario[] = [
  {
    nombre: "codigo",
    etiqueta: "Código",
    requerido: true,
    maxLength: 100,
    ayuda: "Ej.: USUARIO_CREAR, ROL_ASIGNAR_PERMISO.",
  },
  {
    nombre: "descripcion",
    etiqueta: "Descripción",
    requerido: true,
    multiline: true,
    filas: 3,
  },
];

export function TablaPermisos() {
  const { puede } = useSession();
  const toast = useToast();
  const listado = useListadoSeguridad(listarPermisosAction, {
    limit: 10,
    sortBy: "codigo",
    sortOrder: "ASC",
  });

  const [formulario, setFormulario] = useState<{
    abierto: boolean;
    permiso: PermisoSeguridad | null;
  }>({ abierto: false, permiso: null });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [porCambiarEstado, setPorCambiarEstado] = useState<PermisoSeguridad | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const columnas = useMemo<GridColDef<PermisoSeguridad>[]>(
    () => [
      { field: "codigo", headerName: "Código", minWidth: 220, flex: 1 },
      { field: "descripcion", headerName: "Descripción", minWidth: 300, flex: 2 },
      {
        field: "estado",
        headerName: "Estado",
        minWidth: 110,
        flex: 0.5,
        sortable: false,
        renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
      },
      {
        field: "acciones",
        type: "actions",
        headerName: "Acciones",
        width: 110,
        sortable: false,
        filterable: false,
        getActions: (parametros) => {
          const acciones = [];
          if (puede(PERMISOS.permisoEditar)) {
            acciones.push(
              <GridActionsCellItem
                key="editar"
                icon={<EditOutlinedIcon />}
                label="Editar"
                onClick={() => {
                  setErrorFormulario(null);
                  setFormulario({ abierto: true, permiso: parametros.row });
                }}
              />,
            );
          }
          if (puede(PERMISOS.permisoEstado)) {
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
                label={parametros.row.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                onClick={() => setPorCambiarEstado(parametros.row)}
              />,
            );
          }
          return acciones;
        },
      },
    ],
    [puede],
  );

  const guardar = async (valores: Record<string, string>) => {
    setGuardando(true);
    setErrorFormulario(null);

    const resultado = formulario.permiso
      ? await actualizarPermisoAction(formulario.permiso.id, {
          codigo: valores.codigo,
          descripcion: valores.descripcion,
        })
      : await crearPermisoAction({
          codigo: valores.codigo,
          descripcion: valores.descripcion,
        });

    setGuardando(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setFormulario({ abierto: false, permiso: null });
      listado.recargar();
    } else {
      setErrorFormulario(resultado.mensaje);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!porCambiarEstado) return;
    setCambiandoEstado(true);
    const resultado = await cambiarEstadoPermisoAction(porCambiarEstado.id);
    setCambiandoEstado(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setPorCambiarEstado(null);
      listado.recargar();
    } else {
      toast.error(resultado.mensaje);
    }
  };

  return (
    <>
      {listado.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {listado.error}
        </Alert>
      ) : null}

      <DataTable<PermisoSeguridad>
        rows={listado.filas}
        columns={columnas}
        loading={listado.cargando}
        meta={listado.paginacion}
        search={listado.busqueda}
        onSearchChange={listado.setBusqueda}
        searchPlaceholder="Buscar por código o descripción…"
        onPaginationChange={listado.cambiarPagina}
        onSortChange={(modelo) =>
          listado.cambiarOrden(
            modelo[0]?.field,
            modelo[0]?.sort === "asc" ? "ASC" : "DESC",
          )
        }
        onCreate={
          puede(PERMISOS.permisoCrear)
            ? () => {
                setErrorFormulario(null);
                setFormulario({ abierto: true, permiso: null });
              }
            : undefined
        }
        createLabel="Nuevo permiso"
        extraToolbar={
          <Stack direction="row" sx={{ gap: 1 }}>
            <SelectorEstado
              valor={String(listado.parametros.status ?? "TODOS")}
              onChange={(valor) => listado.actualizarFiltro("status", valor)}
            />
          </Stack>
        }
      />

      <DialogoFormulario
        abierto={formulario.abierto}
        titulo={formulario.permiso ? "Editar permiso" : "Nuevo permiso"}
        campos={CAMPOS}
        valoresIniciales={{
          codigo: formulario.permiso?.codigo ?? "",
          descripcion: formulario.permiso?.descripcion ?? "",
        }}
        guardando={guardando}
        error={errorFormulario}
        textoGuardar={formulario.permiso ? "Guardar cambios" : "Registrar"}
        onCerrar={() => {
          if (!guardando) setFormulario({ abierto: false, permiso: null });
        }}
        onGuardar={guardar}
      />

      <ConfirmDialog
        open={porCambiarEstado !== null}
        title={
          porCambiarEstado?.estado === "ACTIVO"
            ? "Desactivar permiso"
            : "Activar permiso"
        }
        message={
          porCambiarEstado
            ? `¿Confirmas ${
                porCambiarEstado.estado === "ACTIVO" ? "desactivar" : "activar"
              } el permiso ${porCambiarEstado.codigo}?`
            : ""
        }
        confirmLabel={porCambiarEstado?.estado === "ACTIVO" ? "Desactivar" : "Activar"}
        confirmColor={porCambiarEstado?.estado === "ACTIVO" ? "error" : "success"}
        loading={cambiandoEstado}
        onCancel={() => setPorCambiarEstado(null)}
        onConfirm={confirmarCambioEstado}
      />
    </>
  );
}
