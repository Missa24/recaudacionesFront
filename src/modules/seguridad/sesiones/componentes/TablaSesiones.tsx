"use client";

import { useMemo, useState } from "react";
import { Alert, Stack, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { DataTable } from "@/common/components/DataTable";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { useToast } from "@/common/components/ToastProvider";
import { PERMISOS } from "../../comun/constantes";
import { useSession } from "../../auth/componentes/SessionProvider";
import { useListadoSeguridad } from "../../comun/hooks/useListadoSeguridad";
import { EtiquetaEstado } from "../../comun/componentes/EtiquetaEstado";
import { SelectorEstado } from "../../comun/componentes/DialogoFormulario";
import { formatearFechaHora, resumirUserAgent } from "../../comun/utilidades";
import type { SesionSeguridad } from "../tipos";
import { cerrarSesionPorIdAction, listarMisSesionesAction } from "../acciones";

/**
 * Módulo: Seguridad / Sesiones
 * Archivo: TablaSesiones.tsx
 *
 * Historial de sesiones del usuario autenticado. La sesión actual no se
 * puede cerrar desde la tabla: para eso está el botón de salir del shell.
 */
export function TablaSesiones() {
  const { puede, contexto } = useSession();
  const toast = useToast();
  const listado = useListadoSeguridad(listarMisSesionesAction, {
    limit: 10,
    sortBy: "inicio",
    sortOrder: "DESC",
  });

  const [porCerrar, setPorCerrar] = useState<SesionSeguridad | null>(null);
  const [cerrando, setCerrando] = useState(false);

  const columnas = useMemo<GridColDef<SesionSeguridad>[]>(
    () => [
      {
        field: "inicio",
        headerName: "Inicio",
        minWidth: 170,
        flex: 1,
        valueGetter: (_valor, fila) => formatearFechaHora(fila.inicio),
      },
      {
        field: "fin",
        headerName: "Fin",
        minWidth: 170,
        flex: 1,
        valueGetter: (_valor, fila) => formatearFechaHora(fila.fin),
      },
      {
        field: "ipAddress",
        headerName: "IP",
        minWidth: 130,
        flex: 0.7,
        valueGetter: (_valor, fila) => fila.ipAddress ?? "—",
      },
      {
        field: "userAgent",
        headerName: "Navegador",
        minWidth: 220,
        flex: 1.2,
        sortable: false,
        renderCell: (parametros) => (
          <Tooltip title={parametros.row.userAgent ?? ""}>
            <span>{resumirUserAgent(parametros.row.userAgent)}</span>
          </Tooltip>
        ),
      },
      {
        field: "estado",
        headerName: "Estado",
        minWidth: 110,
        flex: 0.5,
        renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
      },
      {
        field: "acciones",
        type: "actions",
        headerName: "Acciones",
        width: 90,
        sortable: false,
        filterable: false,
        getActions: (parametros) => {
          const esActual = parametros.row.id === contexto.sesion_id;
          if (
            !puede(PERMISOS.sesionCerrar) ||
            parametros.row.estado !== "ACTIVO" ||
            esActual
          ) {
            return [];
          }
          return [
            <GridActionsCellItem
              key="cerrar"
              icon={<LogoutOutlinedIcon />}
              label="Cerrar sesión"
              onClick={() => setPorCerrar(parametros.row)}
            />,
          ];
        },
      },
    ],
    [contexto.sesion_id, puede],
  );

  const confirmarCierre = async () => {
    if (!porCerrar) return;
    setCerrando(true);
    const resultado = await cerrarSesionPorIdAction(porCerrar.id);
    setCerrando(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setPorCerrar(null);
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

      <DataTable<SesionSeguridad>
        rows={listado.filas}
        columns={columnas}
        loading={listado.cargando}
        meta={listado.paginacion}
        hideSearch
        onPaginationChange={listado.cambiarPagina}
        onSortChange={(modelo) =>
          listado.cambiarOrden(
            modelo[0]?.field,
            modelo[0]?.sort === "asc" ? "ASC" : "DESC",
          )
        }
        extraToolbar={
          <Stack direction="row" sx={{ gap: 1 }}>
            <SelectorEstado
              valor={String(listado.parametros.status ?? "TODOS")}
              onChange={(valor) => listado.actualizarFiltro("status", valor)}
            />
          </Stack>
        }
      />

      <ConfirmDialog
        open={porCerrar !== null}
        title="Cerrar sesión"
        message={
          porCerrar
            ? `¿Confirmas cerrar la sesión iniciada el ${formatearFechaHora(
                porCerrar.inicio,
              )}?`
            : ""
        }
        confirmLabel="Cerrar sesión"
        confirmColor="warning"
        loading={cerrando}
        onCancel={() => setPorCerrar(null)}
        onConfirm={confirmarCierre}
      />
    </>
  );
}
