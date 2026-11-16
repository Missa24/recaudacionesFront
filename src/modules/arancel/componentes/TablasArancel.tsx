"use client";

import { useMemo } from "react";
import type { GridColDef } from "@mui/x-data-grid";
import { TablaRecurso } from "@/common/crud/TablaRecurso";
import type { CampoFormulario, OpcionSelect } from "@/common/crud/tipos";
import { EtiquetaEstado } from "@/modules/seguridad/comun/componentes/EtiquetaEstado";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { formatearFecha } from "@/modules/seguridad/comun/utilidades";
import type {
  ArancelDetalle,
  ArancelGeneral,
  ArancelRango,
  ArancelRequisito,
  Tarifa,
  TipoTramite,
} from "../tipos";
import {
  actualizarArancelDetalleAction,
  actualizarArancelGeneralAction,
  actualizarArancelRangoAction,
  actualizarArancelRequisitoAction,
  actualizarTarifaAction,
  actualizarTipoTramiteAction,
  cambiarEstadoArancelDetalleAction,
  cambiarEstadoArancelGeneralAction,
  cambiarEstadoArancelRangoAction,
  cambiarEstadoArancelRequisitoAction,
  cambiarEstadoTarifaAction,
  cambiarEstadoTipoTramiteAction,
  crearArancelDetalleAction,
  crearArancelGeneralAction,
  crearArancelRangoAction,
  crearArancelRequisitoAction,
  crearTarifaAction,
  crearTipoTramiteAction,
  listarArancelesDetalleAction,
  listarArancelesGeneralesAction,
  listarArancelesRangoAction,
  listarArancelesRequisitoAction,
  listarTarifasAction,
  listarTiposTramiteAction,
} from "../acciones";
import { useArancelOpciones } from "./ArancelOpciones";

function etiquetaDe(opciones: OpcionSelect[], id: string | null): string {
  if (!id) return "—";
  return opciones.find((opcion) => opcion.valor === id)?.etiqueta ?? id;
}

function monto(valor: number | null): string {
  if (valor === null || !Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2 }).format(valor);
}

export function TablaTiposTramite() {
  const { dependencias } = useArancelOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      { nombre: "codigo", etiqueta: "Código", requerido: true, maxLength: 30 },
      { nombre: "nombre", etiqueta: "Nombre", requerido: true, maxLength: 200 },
      { nombre: "tipo_vut", etiqueta: "Tipo VUT", requerido: true, maxLength: 30 },
      {
        nombre: "dependencia_ejecutora_id",
        etiqueta: "Dependencia ejecutora",
        tipo: "select",
        opciones: dependencias,
      },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "multiline" },
      { nombre: "requiere_hoja_ruta", etiqueta: "Requiere hoja de ruta", tipo: "boolean" },
      { nombre: "requiere_derivacion", etiqueta: "Requiere derivación", tipo: "boolean" },
    ],
    [dependencias],
  );

  const columnas: GridColDef<TipoTramite>[] = [
    { field: "codigo", headerName: "Código", minWidth: 120, flex: 0.5 },
    { field: "nombre", headerName: "Nombre", minWidth: 260, flex: 1.5 },
    { field: "tipo_vut", headerName: "Tipo VUT", minWidth: 130, flex: 0.5 },
    {
      field: "dependencia_ejecutora_id",
      headerName: "Dependencia",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(dependencias, fila.dependencia_ejecutora_id),
    },
    {
      field: "requiere_hoja_ruta",
      headerName: "Hoja de ruta",
      minWidth: 120,
      flex: 0.5,
      valueGetter: (_valor, fila) => (fila.requiere_hoja_ruta ? "Sí" : "No"),
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
    <TablaRecurso<TipoTramite>
      cargar={listarTiposTramiteAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        codigo: fila?.codigo ?? "",
        nombre: fila?.nombre ?? "",
        tipo_vut: fila?.tipo_vut ?? "",
        dependencia_ejecutora_id: fila?.dependencia_ejecutora_id ?? "",
        descripcion: fila?.descripcion ?? "",
        requiere_hoja_ruta: fila?.requiere_hoja_ruta ?? false,
        requiere_derivacion: fila?.requiere_derivacion ?? false,
      })}
      crear={crearTipoTramiteAction}
      actualizar={actualizarTipoTramiteAction}
      cambiarEstado={cambiarEstadoTipoTramiteAction}
      permisos={{
        crear: PERMISOS.tipoTramiteGestionar,
        editar: PERMISOS.tipoTramiteGestionar,
        estado: PERMISOS.tipoTramiteGestionar,
      }}
      etiquetaCrear="Nuevo tipo de trámite"
      etiquetaEntidad="tipo de trámite"
      searchPlaceholder="Buscar por código o nombre…"
    />
  );
}

export function TablaArancelesGenerales() {
  const { dependencias, cuentas } = useArancelOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      {
        nombre: "dependencia_id",
        etiqueta: "Dependencia",
        tipo: "select",
        opciones: dependencias,
        requerido: true,
      },
      { nombre: "nro_arancel_gral", etiqueta: "N° arancel", requerido: true, maxLength: 15 },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "multiline", requerido: true, maxLength: 200 },
      {
        nombre: "cuenta_destino_id",
        etiqueta: "Cuenta destino",
        tipo: "select",
        opciones: cuentas,
      },
    ],
    [dependencias, cuentas],
  );

  const columnas: GridColDef<ArancelGeneral>[] = [
    { field: "nro_arancel_gral", headerName: "N° arancel", minWidth: 130, flex: 0.5 },
    { field: "descripcion", headerName: "Descripción", minWidth: 280, flex: 1.5 },
    {
      field: "dependencia_id",
      headerName: "Dependencia",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(dependencias, fila.dependencia_id),
    },
    {
      field: "cuenta_destino_id",
      headerName: "Cuenta destino",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(cuentas, fila.cuenta_destino_id),
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
    <TablaRecurso<ArancelGeneral>
      cargar={listarArancelesGeneralesAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        dependencia_id: fila?.dependencia_id ?? "",
        nro_arancel_gral: fila?.nro_arancel_gral ?? "",
        descripcion: fila?.descripcion ?? "",
        cuenta_destino_id: fila?.cuenta_destino_id ?? "",
      })}
      crear={crearArancelGeneralAction}
      actualizar={actualizarArancelGeneralAction}
      cambiarEstado={cambiarEstadoArancelGeneralAction}
      permisos={{
        crear: PERMISOS.arancelGeneralGestionar,
        editar: PERMISOS.arancelGeneralGestionar,
        estado: PERMISOS.arancelGeneralGestionar,
      }}
      etiquetaCrear="Nuevo arancel"
      etiquetaEntidad="arancel"
      searchPlaceholder="Buscar por número o descripción…"
    />
  );
}

export function TablaArancelesDetalle() {
  const { arancelesGenerales, tiposTramite } = useArancelOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      {
        nombre: "arancel_general_id",
        etiqueta: "Arancel general",
        tipo: "select",
        opciones: arancelesGenerales,
        requerido: true,
      },
      {
        nombre: "tipo_tramite_id",
        etiqueta: "Tipo de trámite",
        tipo: "select",
        opciones: tiposTramite,
        requerido: true,
      },
      { nombre: "nro_arancel_det", etiqueta: "N° detalle", requerido: true, maxLength: 20 },
      { nombre: "descripcion", etiqueta: "Descripción", tipo: "multiline", requerido: true, maxLength: 250 },
      { nombre: "monto_variable", etiqueta: "Monto variable", tipo: "boolean" },
      { nombre: "unidad_calculo", etiqueta: "Unidad de cálculo", maxLength: 80 },
    ],
    [arancelesGenerales, tiposTramite],
  );

  const columnas: GridColDef<ArancelDetalle>[] = [
    { field: "nro_arancel_det", headerName: "N° detalle", minWidth: 130, flex: 0.5 },
    { field: "descripcion", headerName: "Descripción", minWidth: 260, flex: 1.4 },
    {
      field: "arancel_general_id",
      headerName: "Arancel general",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(arancelesGenerales, fila.arancel_general_id),
    },
    {
      field: "tipo_tramite_id",
      headerName: "Tipo de trámite",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(tiposTramite, fila.tipo_tramite_id),
    },
    {
      field: "monto_variable",
      headerName: "Variable",
      minWidth: 100,
      flex: 0.4,
      valueGetter: (_valor, fila) => (fila.monto_variable ? "Sí" : "No"),
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
    <TablaRecurso<ArancelDetalle>
      cargar={listarArancelesDetalleAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        arancel_general_id: fila?.arancel_general_id ?? "",
        tipo_tramite_id: fila?.tipo_tramite_id ?? "",
        nro_arancel_det: fila?.nro_arancel_det ?? "",
        descripcion: fila?.descripcion ?? "",
        monto_variable: fila?.monto_variable ?? false,
        unidad_calculo: fila?.unidad_calculo ?? "",
      })}
      crear={crearArancelDetalleAction}
      actualizar={actualizarArancelDetalleAction}
      cambiarEstado={cambiarEstadoArancelDetalleAction}
      permisos={{
        crear: PERMISOS.arancelDetalleGestionar,
        editar: PERMISOS.arancelDetalleGestionar,
        estado: PERMISOS.arancelDetalleGestionar,
      }}
      etiquetaCrear="Nuevo detalle"
      etiquetaEntidad="detalle de arancel"
      searchPlaceholder="Buscar por número o descripción…"
    />
  );
}

export function TablaTarifas() {
  const { arancelesDetalle } = useArancelOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      {
        nombre: "arancel_det_id",
        etiqueta: "Detalle de arancel",
        tipo: "select",
        opciones: arancelesDetalle,
        requerido: true,
        ancho: 12,
      },
      { nombre: "vigente_desde", etiqueta: "Vigente desde", tipo: "date", requerido: true },
      { nombre: "vigente_hasta", etiqueta: "Vigente hasta", tipo: "date" },
      { nombre: "monto", etiqueta: "Monto", tipo: "number", requerido: true, min: 0, step: 0.01 },
      { nombre: "referencia_aprobacion", etiqueta: "Referencia de aprobación", requerido: true, maxLength: 200, ancho: 12 },
    ],
    [arancelesDetalle],
  );

  const columnas: GridColDef<Tarifa>[] = [
    {
      field: "arancel_det_id",
      headerName: "Detalle",
      minWidth: 240,
      flex: 1.2,
      valueGetter: (_valor, fila) => etiquetaDe(arancelesDetalle, fila.arancel_det_id),
    },
    {
      field: "monto",
      headerName: "Monto",
      minWidth: 130,
      flex: 0.5,
      valueGetter: (_valor, fila) => monto(fila.monto),
    },
    {
      field: "vigente_desde",
      headerName: "Desde",
      minWidth: 130,
      flex: 0.5,
      valueGetter: (_valor, fila) => formatearFecha(fila.vigente_desde),
    },
    {
      field: "vigente_hasta",
      headerName: "Hasta",
      minWidth: 130,
      flex: 0.5,
      valueGetter: (_valor, fila) => formatearFecha(fila.vigente_hasta),
    },
    { field: "referencia_aprobacion", headerName: "Referencia", minWidth: 220, flex: 1 },
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
    <TablaRecurso<Tarifa>
      cargar={listarTarifasAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        arancel_det_id: fila?.arancel_det_id ?? "",
        vigente_desde: fila?.vigente_desde?.slice(0, 10) ?? "",
        vigente_hasta: fila?.vigente_hasta?.slice(0, 10) ?? "",
        monto: fila ? String(fila.monto) : "",
        referencia_aprobacion: fila?.referencia_aprobacion ?? "",
      })}
      crear={crearTarifaAction}
      actualizar={actualizarTarifaAction}
      cambiarEstado={cambiarEstadoTarifaAction}
      permisos={{
        crear: PERMISOS.tarifaGestionar,
        editar: PERMISOS.tarifaGestionar,
        estado: PERMISOS.tarifaGestionar,
      }}
      etiquetaCrear="Nueva tarifa"
      etiquetaEntidad="tarifa"
      searchPlaceholder="Buscar por referencia…"
    />
  );
}

export function TablaArancelesRango() {
  const { tarifas } = useArancelOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      {
        nombre: "tarifa_id",
        etiqueta: "Tarifa",
        tipo: "select",
        opciones: tarifas,
        requerido: true,
        ancho: 12,
      },
      { nombre: "desde", etiqueta: "Desde", tipo: "number", requerido: true, min: 0, step: 0.01 },
      { nombre: "hasta", etiqueta: "Hasta", tipo: "number", min: 0, step: 0.01 },
      { nombre: "base_fija", etiqueta: "Base fija", tipo: "number", requerido: true, min: 0, step: 0.01 },
      { nombre: "porcentaje", etiqueta: "Porcentaje", tipo: "number", requerido: true, min: 0, max: 99.9999, step: 0.0001 },
      { nombre: "excedente", etiqueta: "Excedente", tipo: "number", requerido: true, min: 0, step: 0.01 },
    ],
    [tarifas],
  );

  const columnas: GridColDef<ArancelRango>[] = [
    {
      field: "tarifa_id",
      headerName: "Tarifa",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(tarifas, fila.tarifa_id),
    },
    { field: "desde", headerName: "Desde", minWidth: 110, flex: 0.5, valueGetter: (_v, f) => monto(f.desde) },
    { field: "hasta", headerName: "Hasta", minWidth: 110, flex: 0.5, valueGetter: (_v, f) => monto(f.hasta) },
    { field: "base_fija", headerName: "Base fija", minWidth: 120, flex: 0.5, valueGetter: (_v, f) => monto(f.base_fija) },
    { field: "porcentaje", headerName: "%", minWidth: 90, flex: 0.4, valueGetter: (_v, f) => String(f.porcentaje) },
    { field: "excedente", headerName: "Excedente", minWidth: 120, flex: 0.5, valueGetter: (_v, f) => monto(f.excedente) },
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
    <TablaRecurso<ArancelRango>
      cargar={listarArancelesRangoAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        tarifa_id: fila?.tarifa_id ?? "",
        desde: fila ? String(fila.desde) : "",
        hasta: fila?.hasta === null || fila?.hasta === undefined ? "" : String(fila.hasta),
        base_fija: fila ? String(fila.base_fija) : "",
        porcentaje: fila ? String(fila.porcentaje) : "",
        excedente: fila ? String(fila.excedente) : "",
      })}
      crear={crearArancelRangoAction}
      actualizar={actualizarArancelRangoAction}
      cambiarEstado={cambiarEstadoArancelRangoAction}
      permisos={{
        crear: PERMISOS.arancelRangoGestionar,
        editar: PERMISOS.arancelRangoGestionar,
        estado: PERMISOS.arancelRangoGestionar,
      }}
      etiquetaCrear="Nuevo rango"
      etiquetaEntidad="rango"
      searchPlaceholder="Buscar rango…"
    />
  );
}

export function TablaArancelesRequisito() {
  const { tiposTramite, requisitos } = useArancelOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      {
        nombre: "tipo_tramite_id",
        etiqueta: "Tipo de trámite",
        tipo: "select",
        opciones: tiposTramite,
        requerido: true,
      },
      {
        nombre: "requisito_catalogo_id",
        etiqueta: "Requisito",
        tipo: "select",
        opciones: requisitos,
        requerido: true,
      },
      { nombre: "orden", etiqueta: "Orden", tipo: "number", requerido: true, min: 1, step: 1 },
      { nombre: "obligatorio", etiqueta: "Obligatorio", tipo: "boolean" },
    ],
    [tiposTramite, requisitos],
  );

  const columnas: GridColDef<ArancelRequisito>[] = [
    {
      field: "tipo_tramite_id",
      headerName: "Tipo de trámite",
      minWidth: 220,
      flex: 1.2,
      valueGetter: (_valor, fila) => etiquetaDe(tiposTramite, fila.tipo_tramite_id),
    },
    {
      field: "requisito_catalogo_id",
      headerName: "Requisito",
      minWidth: 260,
      flex: 1.4,
      valueGetter: (_valor, fila) => etiquetaDe(requisitos, fila.requisito_catalogo_id),
    },
    { field: "orden", headerName: "Orden", minWidth: 90, flex: 0.4 },
    {
      field: "obligatorio",
      headerName: "Obligatorio",
      minWidth: 120,
      flex: 0.5,
      valueGetter: (_valor, fila) => (fila.obligatorio ? "Sí" : "No"),
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
    <TablaRecurso<ArancelRequisito>
      cargar={listarArancelesRequisitoAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        tipo_tramite_id: fila?.tipo_tramite_id ?? "",
        requisito_catalogo_id: fila?.requisito_catalogo_id ?? "",
        orden: fila ? String(fila.orden) : "1",
        obligatorio: fila?.obligatorio ?? true,
      })}
      crear={crearArancelRequisitoAction}
      actualizar={actualizarArancelRequisitoAction}
      cambiarEstado={cambiarEstadoArancelRequisitoAction}
      permisos={{
        crear: PERMISOS.arancelRequisitoGestionar,
        editar: PERMISOS.arancelRequisitoGestionar,
        estado: PERMISOS.arancelRequisitoGestionar,
      }}
      etiquetaCrear="Asociar requisito"
      etiquetaEntidad="requisito del trámite"
      searchPlaceholder="Buscar requisito…"
    />
  );
}
