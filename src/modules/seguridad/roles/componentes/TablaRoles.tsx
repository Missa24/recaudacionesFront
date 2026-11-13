"use client";

import { useMemo, useState } from "react";
import { Alert, Stack } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
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
import type { RolSeguridad } from "../tipos";
import {
  actualizarRolAction,
  cambiarEstadoRolAction,
  crearRolAction,
  listarRolesAction,
} from "../acciones";
import { DialogoPermisosRol } from "./DialogoPermisosRol";

/**
 * Módulo: Seguridad / Roles
 * Archivo: TablaRoles.tsx
 *
 * Catálogo de roles con alta, edición, cambio de estado y acceso al editor
 * de permisos por módulo.
 */

const CAMPOS: CampoFormulario[] = [
  {
    nombre: "codigo",
    etiqueta: "Código",
    requerido: true,
    maxLength: 40,
    ayuda: "Mayúsculas, números y guion bajo. Ej.: ADMINISTRADOR.",
  },
  {
    nombre: "descripcion",
    etiqueta: "Descripción",
    requerido: true,
    multiline: true,
    filas: 3,
    maxLength: 150,
  },
];

export function TablaRoles() {
  const { puede } = useSession();
  const toast = useToast();
  const listado = useListadoSeguridad(listarRolesAction, {
    limit: 10,
    sortBy: "codigo",
    sortOrder: "ASC",
  });

  const [formulario, setFormulario] = useState<{
    abierto: boolean;
    rol: RolSeguridad | null;
  }>({ abierto: false, rol: null });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [rolPermisos, setRolPermisos] = useState<RolSeguridad | null>(null);
  const [porCambiarEstado, setPorCambiarEstado] = useState<RolSeguridad | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const columnas = useMemo<GridColDef<RolSeguridad>[]>(
    () => [
      { field: "codigo", headerName: "Código", minWidth: 180, flex: 0.8 },
      { field: "descripcion", headerName: "Descripción", minWidth: 260, flex: 1.6 },
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
        width: 130,
        sortable: false,
        filterable: false,
        getActions: (parametros) => {
          const acciones = [];
          if (puede(PERMISOS.rolEditar)) {
            acciones.push(
              <GridActionsCellItem
                key="editar"
                icon={<EditOutlinedIcon />}
                label="Editar"
                onClick={() => {
                  setErrorFormulario(null);
                  setFormulario({ abierto: true, rol: parametros.row });
                }}
              />,
            );
          }
          if (puede(PERMISOS.rolAsignarPermiso)) {
            acciones.push(
              <GridActionsCellItem
                key="permisos"
                icon={<LockOpenOutlinedIcon />}
                label="Permisos"
                onClick={() => setRolPermisos(parametros.row)}
              />,
            );
          }
          if (puede(PERMISOS.rolEstado)) {
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

    const resultado = formulario.rol
      ? await actualizarRolAction(formulario.rol.id, {
          codigo: valores.codigo,
          descripcion: valores.descripcion,
        })
      : await crearRolAction({
          codigo: valores.codigo,
          descripcion: valores.descripcion,
        });

    setGuardando(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setFormulario({ abierto: false, rol: null });
      listado.recargar();
    } else {
      setErrorFormulario(resultado.mensaje);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!porCambiarEstado) return;
    setCambiandoEstado(true);
    const resultado = await cambiarEstadoRolAction(porCambiarEstado.id);
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

      <DataTable<RolSeguridad>
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
          puede(PERMISOS.rolCrear)
            ? () => {
                setErrorFormulario(null);
                setFormulario({ abierto: true, rol: null });
              }
            : undefined
        }
        createLabel="Nuevo rol"
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
        titulo={formulario.rol ? "Editar rol" : "Nuevo rol"}
        campos={CAMPOS}
        valoresIniciales={{
          codigo: formulario.rol?.codigo ?? "",
          descripcion: formulario.rol?.descripcion ?? "",
        }}
        guardando={guardando}
        error={errorFormulario}
        textoGuardar={formulario.rol ? "Guardar cambios" : "Registrar"}
        onCerrar={() => {
          if (!guardando) setFormulario({ abierto: false, rol: null });
        }}
        onGuardar={guardar}
      />

      <DialogoPermisosRol
        rol={rolPermisos}
        abierto={rolPermisos !== null}
        onCerrar={() => setRolPermisos(null)}
        onGuardado={listado.recargar}
      />

      <ConfirmDialog
        open={porCambiarEstado !== null}
        title={
          porCambiarEstado?.estado === "ACTIVO" ? "Desactivar rol" : "Activar rol"
        }
        message={
          porCambiarEstado
            ? `¿Confirmas ${
                porCambiarEstado.estado === "ACTIVO" ? "desactivar" : "activar"
              } el rol ${porCambiarEstado.codigo}?`
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
