"use server";

import { PERMISOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import type {
  ParametrosListado,
  ResultadoAccion,
  ResultadoListado,
} from "@/modules/seguridad/comun/tipos";
import {
  ejecutarAccion,
  ejecutarLectura,
} from "@/modules/seguridad/auth/servidor/accion-protegida";
import type { ValorFormulario } from "@/common/crud/tipos";
import type {
  ArancelDetalle,
  ArancelGeneral,
  ArancelRango,
  ArancelRequisito,
  Tarifa,
  TipoTramite,
} from "./tipos";
import {
  actualizarArancelDetalle,
  actualizarArancelGeneral,
  actualizarArancelRango,
  actualizarArancelRequisito,
  actualizarTarifa,
  actualizarTipoTramite,
  cambiarEstadoArancelDetalle,
  cambiarEstadoArancelGeneral,
  cambiarEstadoArancelRango,
  cambiarEstadoArancelRequisito,
  cambiarEstadoTarifa,
  cambiarEstadoTipoTramite,
  crearArancelDetalle,
  crearArancelGeneral,
  crearArancelRango,
  crearArancelRequisito,
  crearTarifa,
  crearTipoTramite,
  listarArancelesDetalle,
  listarArancelesGenerales,
  listarArancelesRango,
  listarArancelesRequisito,
  listarTarifas,
  listarTiposTramite,
} from "./servidor/servicio-arancel";

/**
 * Módulo: Aranceles
 * Archivo: acciones.ts
 *
 * Server Actions de aranceles. Lecturas con `*_VER`; escrituras con
 * `*_GESTIONAR`.
 */

function texto(valor: ValorFormulario | undefined): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor: ValorFormulario | undefined): number {
  const convertido = Number(texto(valor).replace(",", "."));
  return Number.isFinite(convertido) ? convertido : 0;
}

function opcional(valor: ValorFormulario | undefined): string | null {
  return texto(valor) || null;
}

/* ------------------------------------------------------------ Tipos de trámite */
export async function listarTiposTramiteAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<TipoTramite>> {
  const resultado = await ejecutarLectura(PERMISOS.tipoTramiteVer, ({ token }) =>
    listarTiposTramite(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearTipoTramiteAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    codigo: texto(valores.codigo),
    nombre: texto(valores.nombre),
    descripcion: opcional(valores.descripcion),
    tipo_vut: texto(valores.tipo_vut),
    dependencia_ejecutora_id: opcional(valores.dependencia_ejecutora_id),
    requiere_hoja_ruta: valores.requiere_hoja_ruta === true,
    requiere_derivacion: valores.requiere_derivacion === true,
  };
  if (!datos.codigo || !datos.nombre || !datos.tipo_vut) {
    return { ok: false, mensaje: "Código, nombre y tipo VUT son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.tipoTramiteGestionar,
    async ({ token }) => {
      const respuesta = await crearTipoTramite(token, datos);
      return respuesta.message || "Tipo de trámite registrado correctamente.";
    },
    [RUTAS.arancelTiposTramite],
  );
}

export async function actualizarTipoTramiteAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.tipoTramiteGestionar,
    async ({ token }) => {
      const respuesta = await actualizarTipoTramite(token, id, {
        codigo: texto(valores.codigo),
        nombre: texto(valores.nombre),
        descripcion: opcional(valores.descripcion),
        tipo_vut: texto(valores.tipo_vut),
        dependencia_ejecutora_id: opcional(valores.dependencia_ejecutora_id),
        requiere_hoja_ruta: valores.requiere_hoja_ruta === true,
        requiere_derivacion: valores.requiere_derivacion === true,
      });
      return respuesta.message || "Tipo de trámite actualizado correctamente.";
    },
    [RUTAS.arancelTiposTramite],
  );
}

export async function cambiarEstadoTipoTramiteAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.tipoTramiteGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoTipoTramite(token, id);
      return respuesta.message || "Estado del tipo de trámite actualizado.";
    },
    [RUTAS.arancelTiposTramite],
  );
}

/* -------------------------------------------------------- Aranceles generales */
export async function listarArancelesGeneralesAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<ArancelGeneral>> {
  const resultado = await ejecutarLectura(
    PERMISOS.arancelGeneralVer,
    ({ token }) => listarArancelesGenerales(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearArancelGeneralAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    dependencia_id: texto(valores.dependencia_id),
    nro_arancel_gral: texto(valores.nro_arancel_gral),
    descripcion: texto(valores.descripcion),
    cuenta_destino_id: opcional(valores.cuenta_destino_id),
  };
  if (!datos.dependencia_id || !datos.nro_arancel_gral || !datos.descripcion) {
    return { ok: false, mensaje: "Dependencia, número y descripción son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.arancelGeneralGestionar,
    async ({ token }) => {
      const respuesta = await crearArancelGeneral(token, datos);
      return respuesta.message || "Arancel registrado correctamente.";
    },
    [RUTAS.arancelGenerales],
  );
}

export async function actualizarArancelGeneralAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelGeneralGestionar,
    async ({ token }) => {
      const respuesta = await actualizarArancelGeneral(token, id, {
        dependencia_id: texto(valores.dependencia_id),
        nro_arancel_gral: texto(valores.nro_arancel_gral),
        descripcion: texto(valores.descripcion),
        cuenta_destino_id: opcional(valores.cuenta_destino_id),
      });
      return respuesta.message || "Arancel actualizado correctamente.";
    },
    [RUTAS.arancelGenerales],
  );
}

export async function cambiarEstadoArancelGeneralAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelGeneralGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoArancelGeneral(token, id);
      return respuesta.message || "Estado del arancel actualizado.";
    },
    [RUTAS.arancelGenerales],
  );
}

/* ----------------------------------------------------------- Arancel detalle */
export async function listarArancelesDetalleAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<ArancelDetalle>> {
  const resultado = await ejecutarLectura(
    PERMISOS.arancelDetalleVer,
    ({ token }) => listarArancelesDetalle(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearArancelDetalleAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    arancel_general_id: texto(valores.arancel_general_id),
    tipo_tramite_id: texto(valores.tipo_tramite_id),
    nro_arancel_det: texto(valores.nro_arancel_det),
    descripcion: texto(valores.descripcion),
    monto_variable: valores.monto_variable === true,
    unidad_calculo: opcional(valores.unidad_calculo),
  };
  if (!datos.arancel_general_id || !datos.tipo_tramite_id || !datos.nro_arancel_det) {
    return { ok: false, mensaje: "Arancel general, tipo de trámite y número son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.arancelDetalleGestionar,
    async ({ token }) => {
      const respuesta = await crearArancelDetalle(token, datos);
      return respuesta.message || "Detalle de arancel registrado correctamente.";
    },
    [RUTAS.arancelDetalles],
  );
}

export async function actualizarArancelDetalleAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelDetalleGestionar,
    async ({ token }) => {
      const respuesta = await actualizarArancelDetalle(token, id, {
        arancel_general_id: texto(valores.arancel_general_id),
        tipo_tramite_id: texto(valores.tipo_tramite_id),
        nro_arancel_det: texto(valores.nro_arancel_det),
        descripcion: texto(valores.descripcion),
        monto_variable: valores.monto_variable === true,
        unidad_calculo: opcional(valores.unidad_calculo),
      });
      return respuesta.message || "Detalle de arancel actualizado correctamente.";
    },
    [RUTAS.arancelDetalles],
  );
}

export async function cambiarEstadoArancelDetalleAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelDetalleGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoArancelDetalle(token, id);
      return respuesta.message || "Estado del detalle actualizado.";
    },
    [RUTAS.arancelDetalles],
  );
}

/* -------------------------------------------------------------------- Tarifas */
export async function listarTarifasAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<Tarifa>> {
  const resultado = await ejecutarLectura(PERMISOS.tarifaVer, ({ token }) =>
    listarTarifas(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearTarifaAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    arancel_det_id: texto(valores.arancel_det_id),
    vigente_desde: texto(valores.vigente_desde),
    vigente_hasta: opcional(valores.vigente_hasta),
    monto: numero(valores.monto),
    referencia_aprobacion: texto(valores.referencia_aprobacion),
  };
  if (!datos.arancel_det_id || !datos.vigente_desde || !datos.referencia_aprobacion) {
    return { ok: false, mensaje: "Detalle, vigencia y referencia son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.tarifaGestionar,
    async ({ token }) => {
      const respuesta = await crearTarifa(token, datos);
      return respuesta.message || "Tarifa registrada correctamente.";
    },
    [RUTAS.arancelTarifas],
  );
}

export async function actualizarTarifaAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.tarifaGestionar,
    async ({ token }) => {
      const respuesta = await actualizarTarifa(token, id, {
        arancel_det_id: texto(valores.arancel_det_id),
        vigente_desde: texto(valores.vigente_desde),
        vigente_hasta: opcional(valores.vigente_hasta),
        monto: numero(valores.monto),
        referencia_aprobacion: texto(valores.referencia_aprobacion),
      });
      return respuesta.message || "Tarifa actualizada correctamente.";
    },
    [RUTAS.arancelTarifas],
  );
}

export async function cambiarEstadoTarifaAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.tarifaGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoTarifa(token, id);
      return respuesta.message || "Estado de la tarifa actualizado.";
    },
    [RUTAS.arancelTarifas],
  );
}

/* --------------------------------------------------------------------- Rangos */
export async function listarArancelesRangoAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<ArancelRango>> {
  const resultado = await ejecutarLectura(PERMISOS.arancelRangoVer, ({ token }) =>
    listarArancelesRango(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearArancelRangoAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    tarifa_id: texto(valores.tarifa_id),
    desde: numero(valores.desde),
    hasta: texto(valores.hasta) ? numero(valores.hasta) : null,
    base_fija: numero(valores.base_fija),
    porcentaje: numero(valores.porcentaje),
    excedente: numero(valores.excedente),
  };
  if (!datos.tarifa_id) return { ok: false, mensaje: "La tarifa es obligatoria." };
  return ejecutarAccion(
    PERMISOS.arancelRangoGestionar,
    async ({ token }) => {
      const respuesta = await crearArancelRango(token, datos);
      return respuesta.message || "Rango registrado correctamente.";
    },
    [RUTAS.arancelRangos],
  );
}

export async function actualizarArancelRangoAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelRangoGestionar,
    async ({ token }) => {
      const respuesta = await actualizarArancelRango(token, id, {
        tarifa_id: texto(valores.tarifa_id),
        desde: numero(valores.desde),
        hasta: texto(valores.hasta) ? numero(valores.hasta) : null,
        base_fija: numero(valores.base_fija),
        porcentaje: numero(valores.porcentaje),
        excedente: numero(valores.excedente),
      });
      return respuesta.message || "Rango actualizado correctamente.";
    },
    [RUTAS.arancelRangos],
  );
}

export async function cambiarEstadoArancelRangoAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelRangoGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoArancelRango(token, id);
      return respuesta.message || "Estado del rango actualizado.";
    },
    [RUTAS.arancelRangos],
  );
}

/* ----------------------------------------------------------------- Requisitos */
export async function listarArancelesRequisitoAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<ArancelRequisito>> {
  const resultado = await ejecutarLectura(
    PERMISOS.arancelRequisitoVer,
    ({ token }) => listarArancelesRequisito(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearArancelRequisitoAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    tipo_tramite_id: texto(valores.tipo_tramite_id),
    requisito_catalogo_id: texto(valores.requisito_catalogo_id),
    obligatorio: valores.obligatorio === true,
    orden: Math.max(1, Math.trunc(numero(valores.orden))),
  };
  if (!datos.tipo_tramite_id || !datos.requisito_catalogo_id) {
    return { ok: false, mensaje: "Tipo de trámite y requisito son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.arancelRequisitoGestionar,
    async ({ token }) => {
      const respuesta = await crearArancelRequisito(token, datos);
      return respuesta.message || "Requisito del trámite registrado correctamente.";
    },
    [RUTAS.arancelRequisitos],
  );
}

export async function actualizarArancelRequisitoAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelRequisitoGestionar,
    async ({ token }) => {
      const respuesta = await actualizarArancelRequisito(token, id, {
        tipo_tramite_id: texto(valores.tipo_tramite_id),
        requisito_catalogo_id: texto(valores.requisito_catalogo_id),
        obligatorio: valores.obligatorio === true,
        orden: Math.max(1, Math.trunc(numero(valores.orden))),
      });
      return respuesta.message || "Requisito del trámite actualizado correctamente.";
    },
    [RUTAS.arancelRequisitos],
  );
}

export async function cambiarEstadoArancelRequisitoAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.arancelRequisitoGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoArancelRequisito(token, id);
      return respuesta.message || "Estado del requisito actualizado.";
    },
    [RUTAS.arancelRequisitos],
  );
}
