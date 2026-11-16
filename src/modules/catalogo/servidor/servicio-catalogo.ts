import "server-only";

import { solicitar } from "@/lib/http/cliente-seguridad";
import type { Pagina, ParametrosListado } from "@/modules/seguridad/comun/tipos";
import type {
  Banco,
  BancoDto,
  Calendario,
  CalendarioDto,
  CuentaBancaria,
  CuentaBancariaDto,
  Dependencia,
  DependenciaDto,
  Interes,
  InteresDto,
  PersonaJuridica,
  PersonaJuridicaDto,
  PersonaNatural,
  PersonaNaturalDto,
  RequisitoCatalogo,
  RequisitoCatalogoDto,
  Ufv,
  UfvDto,
} from "../tipos";

/**
 * Módulo: Catálogos
 * Archivo: servicio-catalogo.ts
 *
 * Acceso HTTP a los catálogos maestros. Centraliza rutas, filtros y
 * conversión de DTOs; las acciones y componentes nunca llaman a `fetch`.
 */

interface Mensaje {
  message: string;
}

interface Opcion {
  valor: string;
  etiqueta: string;
}

/** Listado paginado con los filtros comunes del backend. */
async function listar<T>(
  token: string,
  ruta: string,
  parametros: ParametrosListado,
  sortBy: string,
  sortOrder: "ASC" | "DESC" = "ASC",
): Promise<Pagina<T>> {
  return solicitar<Pagina<T>>(ruta, {
    token,
    query: {
      page: parametros.page ?? 1,
      limit: parametros.limit ?? 10,
      search: parametros.search,
      status: parametros.status ?? "TODOS",
      sortBy: parametros.sortBy ?? sortBy,
      sortOrder: parametros.sortOrder ?? sortOrder,
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

/* ------------------------------------------------------------------ Bancos */
export function listarBancos(token: string, parametros: ParametrosListado) {
  return listar<Banco>(token, "/banco", parametros, "createdAt", "DESC");
}
export function crearBanco(token: string, datos: BancoDto) {
  return crear(token, "/banco", datos);
}
export function actualizarBanco(token: string, id: string, datos: Partial<BancoDto>) {
  return actualizar(token, `/banco/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoBanco(token: string, id: string) {
  return alternarEstado(token, `/banco/${encodeURIComponent(id)}/estado`);
}

/* ------------------------------------------------------------ Dependencias */
export function listarDependencias(token: string, parametros: ParametrosListado) {
  return listar<Dependencia>(token, "/dependencia", parametros, "createdAt", "DESC");
}
export function crearDependencia(token: string, datos: DependenciaDto) {
  return crear(token, "/dependencia", datos);
}
export function actualizarDependencia(
  token: string,
  id: string,
  datos: Partial<DependenciaDto>,
) {
  return actualizar(token, `/dependencia/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoDependencia(token: string, id: string) {
  return alternarEstado(token, `/dependencia/estado/${encodeURIComponent(id)}`);
}

/* ----------------------------------------------------------------- Cuentas */
export function listarCuentasBancarias(token: string, parametros: ParametrosListado) {
  return listar<CuentaBancaria>(
    token,
    "/cuenta-bancaria",
    parametros,
    "createdAt",
    "DESC",
  );
}
export function crearCuentaBancaria(token: string, datos: CuentaBancariaDto) {
  return crear(token, "/cuenta-bancaria", datos);
}
export function actualizarCuentaBancaria(
  token: string,
  id: string,
  datos: Partial<CuentaBancariaDto>,
) {
  return actualizar(token, `/cuenta-bancaria/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoCuentaBancaria(token: string, id: string) {
  return alternarEstado(token, `/cuenta-bancaria/${encodeURIComponent(id)}/estado`);
}

/* ---------------------------------------------------------------- Intereses */
export function listarIntereses(token: string, parametros: ParametrosListado) {
  return listar<Interes>(token, "/interes", parametros, "fecha_publicacion", "DESC");
}
export function crearInteres(token: string, datos: InteresDto) {
  return crear(token, "/interes", datos);
}
export function actualizarInteres(
  token: string,
  id: string,
  datos: Partial<InteresDto>,
) {
  return actualizar(token, `/interes/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoInteres(token: string, id: string) {
  return alternarEstado(token, `/interes/${encodeURIComponent(id)}/estado`);
}

/* -------------------------------------------------------------- Calendario */
export function listarCalendario(token: string, parametros: ParametrosListado) {
  return listar<Calendario>(
    token,
    "/catalogos/calendario",
    parametros,
    "fecha",
    "DESC",
  );
}
export function crearCalendario(token: string, datos: CalendarioDto) {
  return crear<CalendarioDto>(token, "/catalogos/calendario", datos);
}
export function crearCalendarioRango(
  token: string,
  datos: { fecha_inicio: string; fecha_fin: string; habil?: boolean; descripcion?: string },
) {
  return crear(token, "/catalogos/calendario/rango", datos);
}
export function actualizarCalendario(
  token: string,
  id: string,
  datos: Partial<CalendarioDto>,
) {
  return actualizar(token, `/catalogos/calendario/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoCalendario(token: string, id: string) {
  return alternarEstado(token, `/catalogos/calendario/${encodeURIComponent(id)}/estado`);
}

/* --------------------------------------------------------- Personas naturales */
export function listarPersonasNaturales(token: string, parametros: ParametrosListado) {
  return listar<PersonaNatural>(
    token,
    "/catalogos/personas-naturales",
    parametros,
    "createdAt",
    "DESC",
  );
}
export function crearPersonaNatural(token: string, datos: PersonaNaturalDto) {
  return crear<PersonaNaturalDto>(token, "/catalogos/personas-naturales", datos);
}
export function actualizarPersonaNatural(
  token: string,
  id: string,
  datos: Partial<PersonaNaturalDto>,
) {
  return actualizar(
    token,
    `/catalogos/personas-naturales/${encodeURIComponent(id)}`,
    datos,
  );
}
export function cambiarEstadoPersonaNatural(token: string, id: string) {
  return alternarEstado(
    token,
    `/catalogos/personas-naturales/${encodeURIComponent(id)}/estado`,
  );
}

/* --------------------------------------------------------- Personas jurídicas */
export function listarPersonasJuridicas(token: string, parametros: ParametrosListado) {
  return listar<PersonaJuridica>(
    token,
    "/catalogos/personas-juridicas",
    parametros,
    "createdAt",
    "DESC",
  );
}
export function crearPersonaJuridica(token: string, datos: PersonaJuridicaDto) {
  return crear<PersonaJuridicaDto>(token, "/catalogos/personas-juridicas", datos);
}
export function actualizarPersonaJuridica(
  token: string,
  id: string,
  datos: Partial<PersonaJuridicaDto>,
) {
  return actualizar(
    token,
    `/catalogos/personas-juridicas/${encodeURIComponent(id)}`,
    datos,
  );
}
export function cambiarEstadoPersonaJuridica(token: string, id: string) {
  return alternarEstado(
    token,
    `/catalogos/personas-juridicas/${encodeURIComponent(id)}/estado`,
  );
}

/* --------------------------------------------------------------- Requisitos */
export function listarRequisitosCatalogo(token: string, parametros: ParametrosListado) {
  return listar<RequisitoCatalogo>(token, "/requisito", parametros, "codigo", "ASC");
}
export function crearRequisitoCatalogo(token: string, datos: RequisitoCatalogoDto) {
  return crear(token, "/requisito", datos);
}
export function actualizarRequisitoCatalogo(
  token: string,
  id: string,
  datos: Partial<RequisitoCatalogoDto>,
) {
  return actualizar(token, `/requisito/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoRequisitoCatalogo(token: string, id: string) {
  return alternarEstado(token, `/requisito/${encodeURIComponent(id)}/estado`);
}

/* --------------------------------------------------------------------- UFV */
export function listarUfv(token: string, parametros: ParametrosListado) {
  return listar<Ufv>(token, "/ufv", parametros, "fecha", "DESC");
}
export function crearUfv(token: string, datos: UfvDto) {
  return crear<UfvDto>(token, "/ufv", datos);
}
export function actualizarUfv(token: string, id: string, datos: Partial<UfvDto>) {
  return actualizar(token, `/ufv/${encodeURIComponent(id)}`, datos);
}
export function cambiarEstadoUfv(token: string, id: string) {
  return alternarEstado(token, `/ufv/${encodeURIComponent(id)}/estado`);
}
export function sincronizarUfv(token: string) {
  return solicitar<{ message: string; total?: number }>("/ufv/sincronizar", {
    method: "POST",
    token,
  });
}

/* ------------------------------------------------------------------ Opciones */
async function opciones<T>(
  token: string,
  ruta: string,
  mapear: (item: T) => Opcion,
): Promise<Opcion[]> {
  const pagina = await solicitar<Pagina<T>>(ruta, {
    token,
    query: { page: 1, limit: 100, status: "ACTIVO", sortBy: "createdAt", sortOrder: "ASC" },
  });
  return pagina.items.map(mapear);
}

export function opcionesBancos(token: string): Promise<Opcion[]> {
  return opciones<Banco>(token, "/banco", (banco) => ({
    valor: banco.id,
    etiqueta: banco.nombre,
  })).catch(() => []);
}

export function opcionesDependencias(token: string): Promise<Opcion[]> {
  return opciones<Dependencia>(token, "/dependencia", (dependencia) => ({
    valor: dependencia.id,
    etiqueta: `${dependencia.abreviacion} · ${dependencia.nombre}`,
  })).catch(() => []);
}

export function opcionesCuentasBancarias(token: string): Promise<Opcion[]> {
  return opciones<CuentaBancaria>(token, "/cuenta-bancaria", (cuenta) => ({
    valor: cuenta.id,
    etiqueta: `${cuenta.nro_cuenta} · ${cuenta.nombre_cuenta}`,
  })).catch(() => []);
}

export function opcionesRequisitosCatalogo(token: string): Promise<Opcion[]> {
  return opciones<RequisitoCatalogo>(token, "/requisito", (requisito) => ({
    valor: requisito.id,
    etiqueta: `${requisito.codigo} · ${requisito.descripcion}`,
  })).catch(() => []);
}
