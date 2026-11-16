import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina, ParametrosListado } from "@/modules/seguridad/comun/tipos";
import type {
  ArancelDetalle,
  ArancelDetalleDto,
  ArancelGeneral,
  ArancelGeneralDto,
  ArancelRango,
  ArancelRangoDto,
  ArancelRequisito,
  ArancelRequisitoDto,
  Tarifa,
  TarifaDto,
  TipoTramite,
  TipoTramiteDto,
} from "../tipos";

/**
 * Módulo: Aranceles
 * Archivo: servicio-arancel.ts
 *
 * Acceso HTTP a tipos de trámite, aranceles, tarifas, rangos y requisitos.
 */

interface Mensaje {
  message: string;
}

interface Opcion {
  valor: string;
  etiqueta: string;
}

async function listar<T>(
  token: string,
  ruta: string,
  parametros: ParametrosListado,
): Promise<Pagina<T>> {
  return solicitar<Pagina<T>>(ruta, {
    token,
    query: {
      page: parametros.page ?? 1,
      limit: parametros.limit ?? 10,
      search: parametros.search,
      status: parametros.status ?? "TODOS",
      sortBy: parametros.sortBy ?? "createdAt",
      sortOrder: parametros.sortOrder ?? "DESC",
    },
  });
}

async function crear<TDto>(
  token: string,
  ruta: string,
  datos: TDto,
): Promise<Mensaje> {
  return solicitar<Mensaje>(ruta, { method: "POST", token, body: datos });
}

async function actualizar<TDto>(
  token: string,
  ruta: string,
  datos: Partial<TDto>,
): Promise<Mensaje> {
  return solicitar<Mensaje>(ruta, { method: "PATCH", token, body: datos });
}

async function alternarEstado(token: string, ruta: string): Promise<Mensaje> {
  return solicitar<Mensaje>(ruta, { method: "PATCH", token });
}

/* ------------------------------------------------------------ Tipos de trámite */
export function listarTiposTramite(token: string, parametros: ParametrosListado) {
  return listar<TipoTramite>(token, "/tipo-tramite-catalogo", parametros);
}
export function crearTipoTramite(token: string, datos: TipoTramiteDto) {
  return crear(token, "/tipo-tramite-catalogo", datos);
}
export function actualizarTipoTramite(
  token: string,
  id: string,
  datos: Partial<TipoTramiteDto>,
) {
  return actualizar(token, `/tipo-tramite-catalogo/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoTipoTramite(token: string, id: string) {
  return alternarEstado(
    token,
    `/tipo-tramite-catalogo/${encodeURIComponent(id)}/estado`,
  );
}

/* -------------------------------------------------------- Aranceles generales */
export function listarArancelesGenerales(token: string, parametros: ParametrosListado) {
  return listar<ArancelGeneral>(token, "/arancel-general", parametros);
}
export function crearArancelGeneral(token: string, datos: ArancelGeneralDto) {
  return crear(token, "/arancel-general", datos);
}
export function actualizarArancelGeneral(
  token: string,
  id: string,
  datos: Partial<ArancelGeneralDto>,
) {
  return actualizar(token, `/arancel-general/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoArancelGeneral(token: string, id: string) {
  return alternarEstado(token, `/arancel-general/${encodeURIComponent(id)}/estado`);
}

/* ----------------------------------------------------------- Arancel detalle */
export function listarArancelesDetalle(token: string, parametros: ParametrosListado) {
  return listar<ArancelDetalle>(token, "/arancel-detalle", parametros);
}
export function crearArancelDetalle(token: string, datos: ArancelDetalleDto) {
  return crear(token, "/arancel-detalle", datos);
}
export function actualizarArancelDetalle(
  token: string,
  id: string,
  datos: Partial<ArancelDetalleDto>,
) {
  return actualizar(token, `/arancel-detalle/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoArancelDetalle(token: string, id: string) {
  return alternarEstado(token, `/arancel-detalle/${encodeURIComponent(id)}/estado`);
}

/* -------------------------------------------------------------------- Tarifas */
export function listarTarifas(token: string, parametros: ParametrosListado) {
  return listar<Tarifa>(token, "/tarifa", parametros);
}
export function crearTarifa(token: string, datos: TarifaDto) {
  return crear(token, "/tarifa", datos);
}
export function actualizarTarifa(
  token: string,
  id: string,
  datos: Partial<TarifaDto>,
) {
  return actualizar(token, `/tarifa/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoTarifa(token: string, id: string) {
  return alternarEstado(token, `/tarifa/${encodeURIComponent(id)}/estado`);
}

/* --------------------------------------------------------------- Rangos */
export function listarArancelesRango(token: string, parametros: ParametrosListado) {
  return listar<ArancelRango>(token, "/arancel-rango", parametros);
}
export function crearArancelRango(token: string, datos: ArancelRangoDto) {
  return crear(token, "/arancel-rango", datos);
}
export function actualizarArancelRango(
  token: string,
  id: string,
  datos: Partial<ArancelRangoDto>,
) {
  return actualizar(token, `/arancel-rango/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoArancelRango(token: string, id: string) {
  return alternarEstado(token, `/arancel-rango/${encodeURIComponent(id)}/estado`);
}

/* ------------------------------------------------------------ Requisitos */
export function listarArancelesRequisito(token: string, parametros: ParametrosListado) {
  return listar<ArancelRequisito>(token, "/arancel-requisito", parametros);
}
export function crearArancelRequisito(token: string, datos: ArancelRequisitoDto) {
  return crear(token, "/arancel-requisito", datos);
}
export function actualizarArancelRequisito(
  token: string,
  id: string,
  datos: Partial<ArancelRequisitoDto>,
) {
  return actualizar(token, `/arancel-requisito/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoArancelRequisito(token: string, id: string) {
  return alternarEstado(token, `/arancel-requisito/${encodeURIComponent(id)}/estado`);
}

/* ------------------------------------------------------------------ Opciones */
async function opciones<T>(
  token: string,
  ruta: string,
  mapear: (item: T) => Opcion,
): Promise<Opcion[]> {
  try {
    const pagina = await solicitar<Pagina<T>>(ruta, {
      token,
      query: {
        page: 1,
        limit: 100,
        status: "ACTIVO",
        sortBy: "createdAt",
        sortOrder: "ASC",
      },
    });
    return pagina.items.map(mapear);
  } catch {
    return [];
  }
}

export function opcionesTiposTramite(token: string): Promise<Opcion[]> {
  return opciones<TipoTramite>(token, "/tipo-tramite-catalogo", (tipo) => ({
    valor: tipo.id,
    etiqueta: `${tipo.codigo} · ${tipo.nombre}`,
  }));
}

export function opcionesArancelesGenerales(token: string): Promise<Opcion[]> {
  return opciones<ArancelGeneral>(token, "/arancel-general", (arancel) => ({
    valor: arancel.id,
    etiqueta: `${arancel.nro_arancel_gral} · ${arancel.descripcion}`,
  }));
}

export function opcionesArancelesDetalle(token: string): Promise<Opcion[]> {
  return opciones<ArancelDetalle>(token, "/arancel-detalle", (detalle) => ({
    valor: detalle.id,
    etiqueta: `${detalle.nro_arancel_det} · ${detalle.descripcion}`,
  }));
}

export function opcionesTarifas(token: string): Promise<Opcion[]> {
  return opciones<Tarifa>(token, "/tarifa", (tarifa) => ({
    valor: tarifa.id,
    etiqueta: `${tarifa.monto} · desde ${tarifa.vigente_desde.slice(0, 10)}`,
  }));
}
