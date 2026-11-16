"use client";

import type { GridColDef } from "@mui/x-data-grid";
import { TablaRecurso } from "@/common/crud/TablaRecurso";
import type { CampoFormulario } from "@/common/crud/tipos";
import { EtiquetaEstado } from "@/modules/seguridad/comun/componentes/EtiquetaEstado";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { formatearFecha } from "@/modules/seguridad/comun/utilidades";
import type { Banco, Dependencia, Interes, RequisitoCatalogo } from "../tipos";
import {
  actualizarBancoAction,
  actualizarDependenciaAction,
  actualizarInteresAction,
  actualizarRequisitoCatalogoAction,
  cambiarEstadoBancoAction,
  cambiarEstadoDependenciaAction,
  cambiarEstadoInteresAction,
  cambiarEstadoRequisitoCatalogoAction,
  crearBancoAction,
  crearDependenciaAction,
  crearInteresAction,
  crearRequisitoCatalogoAction,
  listarBancosAction,
  listarDependenciasAction,
  listarInteresesAction,
  listarRequisitosCatalogoAction,
} from "../acciones";

/**
 * Módulo: Catálogos
 * Archivo: TablaCatalogosSimples.tsx
 *
 * Tablas de los catálogos sin relaciones obligatorias: bancos,
 * dependencias, intereses y requisitos.
 */

const CAMPOS_BANCO: CampoFormulario[] = [
  { nombre: "nombre", etiqueta: "Nombre", requerido: true, maxLength: 100 },
  { nombre: "codigo_bc", etiqueta: "Código BC", maxLength: 10 },
];

export function TablaBancos() {
  const columnas: GridColDef<Banco>[] = [
    { field: "nombre", headerName: "Nombre", minWidth: 240, flex: 1.5 },
    { field: "codigo_bc", headerName: "Código BC", minWidth: 120, flex: 0.5 },
    {
      field: "estado",
      headerName: "Estado",
      minWidth: 110,
      flex: 0.5,
      sortable: false,
      renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
    },
  ];

  return (
    <TablaRecurso<Banco>
      cargar={listarBancosAction}
      columnas={columnas}
      campos={CAMPOS_BANCO}
      valoresIniciales={(fila) => ({
        nombre: fila?.nombre ?? "",
        codigo_bc: fila?.codigo_bc ?? "",
      })}
      crear={crearBancoAction}
      actualizar={actualizarBancoAction}
      cambiarEstado={cambiarEstadoBancoAction}
      permisos={{
        crear: PERMISOS.bancoGestionar,
        editar: PERMISOS.bancoGestionar,
        estado: PERMISOS.bancoGestionar,
      }}
      etiquetaCrear="Nuevo banco"
      etiquetaEntidad="banco"
      searchPlaceholder="Buscar banco por nombre…"
    />
  );
}

const CAMPOS_DEPENDENCIA: CampoFormulario[] = [
  { nombre: "codigo", etiqueta: "Código", requerido: true, maxLength: 20 },
  { nombre: "abreviacion", etiqueta: "Abreviación", requerido: true, maxLength: 30 },
  { nombre: "nombre", etiqueta: "Nombre", requerido: true, maxLength: 200, ancho: 12 },
];

export function TablaDependencias() {
  const columnas: GridColDef<Dependencia>[] = [
    { field: "codigo", headerName: "Código", minWidth: 130, flex: 0.5 },
    { field: "nombre", headerName: "Nombre", minWidth: 280, flex: 1.6 },
    { field: "abreviacion", headerName: "Abreviación", minWidth: 130, flex: 0.6 },
    {
      field: "es_unidad_desconcentrada",
      headerName: "Desconcentrada",
      minWidth: 130,
      flex: 0.5,
      valueGetter: (_valor, fila) => (fila.es_unidad_desconcentrada ? "Sí" : "No"),
    },
    {
      field: "estado",
      headerName: "Estado",
      minWidth: 110,
      flex: 0.5,
      sortable: false,
      renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
    },
  ];

  return (
    <TablaRecurso<Dependencia>
      cargar={listarDependenciasAction}
      columnas={columnas}
      campos={CAMPOS_DEPENDENCIA}
      valoresIniciales={(fila) => ({
        codigo: fila?.codigo ?? "",
        abreviacion: fila?.abreviacion ?? "",
        nombre: fila?.nombre ?? "",
      })}
      crear={crearDependenciaAction}
      actualizar={actualizarDependenciaAction}
      cambiarEstado={cambiarEstadoDependenciaAction}
      permisos={{
        crear: PERMISOS.dependenciaGestionar,
        editar: PERMISOS.dependenciaGestionar,
        estado: PERMISOS.dependenciaGestionar,
      }}
      etiquetaCrear="Nueva dependencia"
      etiquetaEntidad="dependencia"
      searchPlaceholder="Buscar por código, nombre o abreviación…"
    />
  );
}

const CAMPOS_INTERES: CampoFormulario[] = [
  {
    nombre: "fecha_publicacion",
    etiqueta: "Fecha de publicación",
    tipo: "date",
    requerido: true,
  },
  {
    nombre: "valor",
    etiqueta: "Valor (%)",
    tipo: "number",
    requerido: true,
    min: 4,
    max: 8,
    step: 0.0001,
    ayuda: "Entre 4 y 8.",
  },
];

export function TablaIntereses() {
  const columnas: GridColDef<Interes>[] = [
    {
      field: "fecha_publicacion",
      headerName: "Fecha",
      minWidth: 140,
      flex: 0.7,
      valueGetter: (_valor, fila) => formatearFecha(fila.fecha_publicacion),
    },
    {
      field: "valor",
      headerName: "Valor",
      minWidth: 120,
      flex: 0.5,
      type: "number",
    },
    {
      field: "estado",
      headerName: "Estado",
      minWidth: 110,
      flex: 0.5,
      sortable: false,
      renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
    },
  ];

  return (
    <TablaRecurso<Interes>
      cargar={listarInteresesAction}
      columnas={columnas}
      campos={CAMPOS_INTERES}
      valoresIniciales={(fila) => ({
        fecha_publicacion: fila?.fecha_publicacion?.slice(0, 10) ?? "",
        valor: fila?.valor ?? "",
      })}
      crear={crearInteresAction}
      actualizar={actualizarInteresAction}
      cambiarEstado={cambiarEstadoInteresAction}
      permisos={{
        crear: PERMISOS.interesGestionar,
        editar: PERMISOS.interesGestionar,
        estado: PERMISOS.interesGestionar,
      }}
      etiquetaCrear="Nuevo interés"
      etiquetaEntidad="interés"
      searchPlaceholder="Buscar por fecha…"
    />
  );
}

const CAMPOS_REQUISITO: CampoFormulario[] = [
  { nombre: "codigo", etiqueta: "Código", requerido: true, maxLength: 50 },
  {
    nombre: "descripcion",
    etiqueta: "Descripción",
    tipo: "multiline",
    requerido: true,
    maxLength: 300,
  },
];

export function TablaRequisitos() {
  const columnas: GridColDef<RequisitoCatalogo>[] = [
    { field: "codigo", headerName: "Código", minWidth: 150, flex: 0.6 },
    { field: "descripcion", headerName: "Descripción", minWidth: 320, flex: 2 },
    {
      field: "estado",
      headerName: "Estado",
      minWidth: 110,
      flex: 0.5,
      sortable: false,
      renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
    },
  ];

  return (
    <TablaRecurso<RequisitoCatalogo>
      cargar={listarRequisitosCatalogoAction}
      columnas={columnas}
      campos={CAMPOS_REQUISITO}
      valoresIniciales={(fila) => ({
        codigo: fila?.codigo ?? "",
        descripcion: fila?.descripcion ?? "",
      })}
      crear={crearRequisitoCatalogoAction}
      actualizar={actualizarRequisitoCatalogoAction}
      cambiarEstado={cambiarEstadoRequisitoCatalogoAction}
      permisos={{
        crear: PERMISOS.requisitoGestionar,
        editar: PERMISOS.requisitoGestionar,
        estado: PERMISOS.requisitoGestionar,
      }}
      etiquetaCrear="Nuevo requisito"
      etiquetaEntidad="requisito"
      searchPlaceholder="Buscar por código o descripción…"
    />
  );
}
