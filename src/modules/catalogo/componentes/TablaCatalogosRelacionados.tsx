"use client";

import { useMemo } from "react";
import { Button, Stack } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { TablaRecurso } from "@/common/crud/TablaRecurso";
import type { CampoFormulario, OpcionSelect } from "@/common/crud/tipos";
import { EtiquetaEstado } from "@/modules/seguridad/comun/componentes/EtiquetaEstado";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { formatearFecha } from "@/modules/seguridad/comun/utilidades";
import { useToast } from "@/common/components/ToastProvider";
import type {
  Calendario,
  CuentaBancaria,
  PersonaJuridica,
  PersonaNatural,
  Ufv,
} from "../tipos";
import {
  actualizarCalendarioAction,
  actualizarCuentaBancariaAction,
  actualizarPersonaJuridicaAction,
  actualizarPersonaNaturalAction,
  actualizarUfvAction,
  cambiarEstadoCalendarioAction,
  cambiarEstadoCuentaBancariaAction,
  cambiarEstadoPersonaJuridicaAction,
  cambiarEstadoPersonaNaturalAction,
  cambiarEstadoUfvAction,
  crearCalendarioAction,
  crearCuentaBancariaAction,
  crearPersonaJuridicaAction,
  crearPersonaNaturalAction,
  crearUfvAction,
  listarCalendarioAction,
  listarCuentasBancariasAction,
  listarPersonasJuridicasAction,
  listarPersonasNaturalesAction,
  listarUfvAction,
  sincronizarUfvAction,
} from "../acciones";
import { useCatalogoOpciones } from "./CatalogoOpciones";

/** Etiqueta legible de una opción; si no existe, muestra el UUID. */
function etiquetaDe(opciones: OpcionSelect[], id: string | null): string {
  if (!id) return "—";
  return opciones.find((opcion) => opcion.valor === id)?.etiqueta ?? id;
}

export function TablaCuentasBancarias() {
  const { bancos, dependencias } = useCatalogoOpciones();

  const campos = useMemo<CampoFormulario[]>(
    () => [
      { nombre: "banco_id", etiqueta: "Banco", tipo: "select", opciones: bancos, requerido: true },
      {
        nombre: "dependencia_id",
        etiqueta: "Dependencia",
        tipo: "select",
        opciones: dependencias,
      },
      { nombre: "nro_cuenta", etiqueta: "Número de cuenta", requerido: true, maxLength: 50 },
      { nombre: "nombre_cuenta", etiqueta: "Nombre de la cuenta", requerido: true, maxLength: 150, ancho: 12 },
      { nombre: "tipo", etiqueta: "Tipo", requerido: true, maxLength: 30 },
    ],
    [bancos, dependencias],
  );

  const columnas: GridColDef<CuentaBancaria>[] = [
    { field: "nro_cuenta", headerName: "N° cuenta", minWidth: 160, flex: 0.8 },
    { field: "nombre_cuenta", headerName: "Nombre", minWidth: 240, flex: 1.3 },
    {
      field: "banco_id",
      headerName: "Banco",
      minWidth: 200,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(bancos, fila.banco_id),
    },
    {
      field: "dependencia_id",
      headerName: "Dependencia",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => etiquetaDe(dependencias, fila.dependencia_id),
    },
    { field: "tipo", headerName: "Tipo", minWidth: 120, flex: 0.5 },
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
    <TablaRecurso<CuentaBancaria>
      cargar={listarCuentasBancariasAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        banco_id: fila?.banco_id ?? "",
        dependencia_id: fila?.dependencia_id ?? "",
        nro_cuenta: fila?.nro_cuenta ?? "",
        nombre_cuenta: fila?.nombre_cuenta ?? "",
        tipo: fila?.tipo ?? "",
      })}
      crear={crearCuentaBancariaAction}
      actualizar={actualizarCuentaBancariaAction}
      cambiarEstado={cambiarEstadoCuentaBancariaAction}
      permisos={{
        crear: PERMISOS.cuentaBancariaGestionar,
        editar: PERMISOS.cuentaBancariaGestionar,
        estado: PERMISOS.cuentaBancariaGestionar,
      }}
      etiquetaCrear="Nueva cuenta"
      etiquetaEntidad="cuenta bancaria"
      searchPlaceholder="Buscar por número o nombre de cuenta…"
    />
  );
}

export function TablaCalendario() {
  const columnas: GridColDef<Calendario>[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      minWidth: 140,
      flex: 0.7,
      valueGetter: (_valor, fila) => formatearFecha(fila.fecha),
    },
    {
      field: "dia_habil",
      headerName: "Día hábil",
      minWidth: 120,
      flex: 0.5,
      valueGetter: (_valor, fila) => (fila.dia_habil ? "Sí" : "No"),
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      minWidth: 300,
      flex: 1.6,
      valueGetter: (_valor, fila) => fila.descripcion ?? "—",
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

  const campos: CampoFormulario[] = [
    { nombre: "fecha", etiqueta: "Fecha", tipo: "date", requerido: true },
    { nombre: "habil", etiqueta: "Es día hábil", tipo: "boolean" },
    {
      nombre: "descripcion",
      etiqueta: "Descripción",
      tipo: "multiline",
      maxLength: 120,
    },
  ];

  return (
    <TablaRecurso<Calendario>
      cargar={listarCalendarioAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        fecha: fila?.fecha?.slice(0, 10) ?? "",
        habil: fila?.dia_habil ?? false,
        descripcion: fila?.descripcion ?? "",
      })}
      crear={crearCalendarioAction}
      actualizar={actualizarCalendarioAction}
      cambiarEstado={cambiarEstadoCalendarioAction}
      permisos={{
        crear: PERMISOS.calendarioGestionar,
        editar: PERMISOS.calendarioGestionar,
        estado: PERMISOS.calendarioGestionar,
      }}
      etiquetaCrear="Nueva fecha"
      etiquetaEntidad="fecha del calendario"
      searchPlaceholder="Buscar por descripción…"
    />
  );
}

export function TablaPersonasNaturales() {
  const columnas: GridColDef<PersonaNatural>[] = [
    {
      field: "numero_documento",
      headerName: "Documento",
      minWidth: 160,
      flex: 0.8,
      valueGetter: (_valor, fila) =>
        `${fila.tipo_documento} ${fila.numero_documento}${fila.complemento ? `-${fila.complemento}` : ""}`,
    },
    { field: "nombres", headerName: "Nombres", minWidth: 200, flex: 1 },
    {
      field: "apellidos",
      headerName: "Apellidos",
      minWidth: 220,
      flex: 1.1,
      valueGetter: (_valor, fila) =>
        [fila.apellido_paterno, fila.apellido_materno].filter(Boolean).join(" ") || "—",
    },
    {
      field: "telefono",
      headerName: "Teléfono",
      minWidth: 130,
      flex: 0.5,
      valueGetter: (_valor, fila) => fila.telefono ?? "—",
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

  const campos: CampoFormulario[] = [
    { nombre: "tipo_documento", etiqueta: "Tipo de documento", requerido: true, maxLength: 20 },
    { nombre: "numero_documento", etiqueta: "Número de documento", requerido: true, maxLength: 30 },
    { nombre: "complemento", etiqueta: "Complemento", maxLength: 10 },
    { nombre: "expedido", etiqueta: "Expedido", maxLength: 10 },
    { nombre: "nombres", etiqueta: "Nombres", requerido: true, maxLength: 150 },
    { nombre: "apellido_paterno", etiqueta: "Apellido paterno", maxLength: 150 },
    { nombre: "apellido_materno", etiqueta: "Apellido materno", maxLength: 150 },
    { nombre: "apellido_casada", etiqueta: "Apellido de casada", maxLength: 150 },
    { nombre: "fecha_nacimiento", etiqueta: "Fecha de nacimiento", tipo: "date" },
    { nombre: "telefono", etiqueta: "Teléfono", maxLength: 20 },
    { nombre: "email", etiqueta: "Correo", tipo: "email" },
    { nombre: "domicilio", etiqueta: "Domicilio", tipo: "multiline", maxLength: 250 },
  ];

  return (
    <TablaRecurso<PersonaNatural>
      cargar={listarPersonasNaturalesAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        tipo_documento: fila?.tipo_documento ?? "CI",
        numero_documento: fila?.numero_documento ?? "",
        complemento: fila?.complemento ?? "",
        expedido: fila?.expedido ?? "",
        nombres: fila?.nombres ?? "",
        apellido_paterno: fila?.apellido_paterno ?? "",
        apellido_materno: fila?.apellido_materno ?? "",
        apellido_casada: fila?.apellido_casada ?? "",
        fecha_nacimiento: fila?.fecha_nacimiento?.slice(0, 10) ?? "",
        telefono: fila?.telefono ?? "",
        email: fila?.email ?? "",
        domicilio: fila?.domicilio ?? "",
      })}
      crear={crearPersonaNaturalAction}
      actualizar={actualizarPersonaNaturalAction}
      cambiarEstado={cambiarEstadoPersonaNaturalAction}
      permisos={{
        crear: PERMISOS.personaNaturalGestionar,
        editar: PERMISOS.personaNaturalGestionar,
        estado: PERMISOS.personaNaturalGestionar,
      }}
      etiquetaCrear="Nueva persona natural"
      etiquetaEntidad="persona natural"
      searchPlaceholder="Buscar por documento, nombres o apellidos…"
    />
  );
}

export function TablaPersonasJuridicas() {
  const columnas: GridColDef<PersonaJuridica>[] = [
    { field: "nit", headerName: "NIT", minWidth: 140, flex: 0.6 },
    { field: "razon_social", headerName: "Razón social", minWidth: 300, flex: 1.8 },
    {
      field: "telefono",
      headerName: "Teléfono",
      minWidth: 130,
      flex: 0.5,
      valueGetter: (_valor, fila) => fila.telefono ?? "—",
    },
    {
      field: "email",
      headerName: "Correo",
      minWidth: 220,
      flex: 1,
      valueGetter: (_valor, fila) => fila.email ?? "—",
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

  const campos: CampoFormulario[] = [
    { nombre: "nit", etiqueta: "NIT", requerido: true, maxLength: 30 },
    { nombre: "razon_social", etiqueta: "Razón social", requerido: true, maxLength: 250, ancho: 12 },
    { nombre: "telefono", etiqueta: "Teléfono", maxLength: 20 },
    { nombre: "email", etiqueta: "Correo", tipo: "email" },
    { nombre: "domicilio", etiqueta: "Domicilio", tipo: "multiline", maxLength: 250 },
  ];

  return (
    <TablaRecurso<PersonaJuridica>
      cargar={listarPersonasJuridicasAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        nit: fila?.nit ?? "",
        razon_social: fila?.razon_social ?? "",
        telefono: fila?.telefono ?? "",
        email: fila?.email ?? "",
        domicilio: fila?.domicilio ?? "",
      })}
      crear={crearPersonaJuridicaAction}
      actualizar={actualizarPersonaJuridicaAction}
      cambiarEstado={cambiarEstadoPersonaJuridicaAction}
      permisos={{
        crear: PERMISOS.personaJuridicaGestionar,
        editar: PERMISOS.personaJuridicaGestionar,
        estado: PERMISOS.personaJuridicaGestionar,
      }}
      etiquetaCrear="Nueva persona jurídica"
      etiquetaEntidad="persona jurídica"
      searchPlaceholder="Buscar por NIT o razón social…"
    />
  );
}

export function TablaUfv() {
  const toast = useToast();

  const columnas: GridColDef<Ufv>[] = [
    {
      field: "fecha",
      headerName: "Fecha",
      minWidth: 140,
      flex: 0.7,
      valueGetter: (_valor, fila) => formatearFecha(fila.fecha),
    },
    { field: "valor", headerName: "Valor", minWidth: 140, flex: 0.6 },
    {
      field: "estado",
      headerName: "Estado",
      minWidth: 110,
      flex: 0.5,
      sortable: false,
      renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
    },
  ];

  const campos: CampoFormulario[] = [
    { nombre: "fecha", etiqueta: "Fecha", tipo: "date", requerido: true },
    {
      nombre: "valor",
      etiqueta: "Valor UFV",
      tipo: "number",
      requerido: true,
      step: 0.000001,
      min: 0,
    },
  ];

  const sincronizar = async () => {
    const resultado = await sincronizarUfvAction();
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      window.location.reload();
    } else {
      toast.error(resultado.mensaje);
    }
  };

  return (
    <TablaRecurso<Ufv>
      cargar={listarUfvAction}
      columnas={columnas}
      campos={campos}
      valoresIniciales={(fila) => ({
        fecha: fila?.fecha?.slice(0, 10) ?? "",
        valor: fila?.valor ?? "",
      })}
      crear={crearUfvAction}
      actualizar={actualizarUfvAction}
      cambiarEstado={cambiarEstadoUfvAction}
      permisos={{
        crear: PERMISOS.ufvGestionar,
        editar: PERMISOS.ufvGestionar,
        estado: PERMISOS.ufvGestionar,
      }}
      etiquetaCrear="Nueva UFV"
      etiquetaEntidad="UFV"
      searchPlaceholder="Buscar por fecha…"
      extraToolbar={
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="outlined" onClick={sincronizar}>
            Sincronizar desde API
          </Button>
        </Stack>
      }
    />
  );
}
