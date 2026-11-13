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
import { textoOMa } from "../../comun/utilidades";
import type { ModuloSeguridad } from "../tipos";
import {
  actualizarModuloAction,
  cambiarEstadoModuloAction,
  crearModuloAction,
  listarModulosAction,
} from "../acciones";

/**
 * Módulo: Seguridad / Módulos
 * Archivo: TablaModulos.tsx
 *
 * Catálogo de módulos funcionales. La ruta de cada módulo es la que usa
 * el menú lateral cuando el usuario tiene permisos en él.
 */

const CAMPOS: CampoFormulario[] = [
  { nombre: "nombre", etiqueta: "Nombre", requerido: true, maxLength: 150 },
  {
    nombre: "codigo",
    etiqueta: "Código",
    requerido: true,
    maxLength: 50,
    ayuda: "Ej.: USUARIOS, RECAUDACIONES.",
  },
  {
    nombre: "ruta",
    etiqueta: "Ruta",
    requerido: true,
    maxLength: 250,
    ayuda: "Ruta interna que abre el módulo. Ej.: /seguridad/usuarios.",
  },
  {
    nombre: "descripcion",
    etiqueta: "Descripción",
    multiline: true,
    filas: 3,
  },
];

export function TablaModulos() {
  const { puede } = useSession();
  const toast = useToast();
  const listado = useListadoSeguridad(listarModulosAction, {
    limit: 10,
    sortBy: "nombre",
    sortOrder: "ASC",
  });

  const [formulario, setFormulario] = useState<{
    abierto: boolean;
    modulo: ModuloSeguridad | null;
  }>({ abierto: false, modulo: null });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [porCambiarEstado, setPorCambiarEstado] = useState<ModuloSeguridad | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const columnas = useMemo<GridColDef<ModuloSeguridad>[]>(
    () => [
      { field: "nombre", headerName: "Nombre", minWidth: 190, flex: 1 },
      { field: "codigo", headerName: "Código", minWidth: 160, flex: 0.7 },
      {
        field: "ruta",
        headerName: "Ruta",
        minWidth: 220,
        flex: 1.1,
        valueGetter: (_valor, fila) => textoOMa(fila.ruta),
      },
      {
        field: "descripcion",
        headerName: "Descripción",
        minWidth: 240,
        flex: 1.2,
        valueGetter: (_valor, fila) => textoOMa(fila.descripcion),
      },
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
          if (puede(PERMISOS.moduloEditar)) {
            acciones.push(
              <GridActionsCellItem
                key="editar"
                icon={<EditOutlinedIcon />}
                label="Editar"
                onClick={() => {
                  setErrorFormulario(null);
                  setFormulario({ abierto: true, modulo: parametros.row });
                }}
              />,
            );
          }
          if (puede(PERMISOS.moduloEstado)) {
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

    const resultado = formulario.modulo
      ? await actualizarModuloAction(formulario.modulo.id, {
          nombre: valores.nombre,
          codigo: valores.codigo,
          ruta: valores.ruta,
          descripcion: valores.descripcion,
        })
      : await crearModuloAction({
          nombre: valores.nombre,
          codigo: valores.codigo,
          ruta: valores.ruta,
          descripcion: valores.descripcion,
        });

    setGuardando(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setFormulario({ abierto: false, modulo: null });
      listado.recargar();
    } else {
      setErrorFormulario(resultado.mensaje);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!porCambiarEstado) return;
    setCambiandoEstado(true);
    const resultado = await cambiarEstadoModuloAction(porCambiarEstado.id);
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

      <DataTable<ModuloSeguridad>
        rows={listado.filas}
        columns={columnas}
        loading={listado.cargando}
        meta={listado.paginacion}
        search={listado.busqueda}
        onSearchChange={listado.setBusqueda}
        searchPlaceholder="Buscar por nombre, código o ruta…"
        onPaginationChange={listado.cambiarPagina}
        onSortChange={(modelo) =>
          listado.cambiarOrden(
            modelo[0]?.field,
            modelo[0]?.sort === "asc" ? "ASC" : "DESC",
          )
        }
        onCreate={
          puede(PERMISOS.moduloCrear)
            ? () => {
                setErrorFormulario(null);
                setFormulario({ abierto: true, modulo: null });
              }
            : undefined
        }
        createLabel="Nuevo módulo"
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
        titulo={formulario.modulo ? "Editar módulo" : "Nuevo módulo"}
        campos={CAMPOS}
        valoresIniciales={{
          nombre: formulario.modulo?.nombre ?? "",
          codigo: formulario.modulo?.codigo ?? "",
          ruta: formulario.modulo?.ruta ?? "",
          descripcion: formulario.modulo?.descripcion ?? "",
        }}
        guardando={guardando}
        error={errorFormulario}
        textoGuardar={formulario.modulo ? "Guardar cambios" : "Registrar"}
        onCerrar={() => {
          if (!guardando) setFormulario({ abierto: false, modulo: null });
        }}
        onGuardar={guardar}
      />

      <ConfirmDialog
        open={porCambiarEstado !== null}
        title={
          porCambiarEstado?.estado === "ACTIVO"
            ? "Desactivar módulo"
            : "Activar módulo"
        }
        message={
          porCambiarEstado
            ? `¿Confirmas ${
                porCambiarEstado.estado === "ACTIVO" ? "desactivar" : "activar"
              } el módulo ${porCambiarEstado.nombre}?`
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
