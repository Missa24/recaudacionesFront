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
  Banco,
  Calendario,
  CuentaBancaria,
  Dependencia,
  Interes,
  PersonaJuridica,
  PersonaNatural,
  RequisitoCatalogo,
  Ufv,
} from "./tipos";
import {
  actualizarBanco,
  actualizarCalendario,
  actualizarCuentaBancaria,
  actualizarDependencia,
  actualizarInteres,
  actualizarPersonaJuridica,
  actualizarPersonaNatural,
  actualizarRequisitoCatalogo,
  actualizarUfv,
  cambiarEstadoBanco,
  cambiarEstadoCalendario,
  cambiarEstadoCuentaBancaria,
  cambiarEstadoDependencia,
  cambiarEstadoInteres,
  cambiarEstadoPersonaJuridica,
  cambiarEstadoPersonaNatural,
  cambiarEstadoRequisitoCatalogo,
  cambiarEstadoUfv,
  crearBanco,
  crearCalendario,
  crearCuentaBancaria,
  crearDependencia,
  crearInteres,
  crearPersonaJuridica,
  crearPersonaNatural,
  crearRequisitoCatalogo,
  crearUfv,
  listarBancos,
  listarCalendario,
  listarCuentasBancarias,
  listarDependencias,
  listarIntereses,
  listarPersonasJuridicas,
  listarPersonasNaturales,
  listarRequisitosCatalogo,
  listarUfv,
  sincronizarUfv,
} from "./servidor/servicio-catalogo";

/**
 * Módulo: Catálogos
 * Archivo: acciones.ts
 *
 * Server Actions de los catálogos. Cada escritura exige `*_GESTIONAR` en
 * el servidor; las lecturas exigen `*_VER`.
 */

function texto(valor: ValorFormulario | undefined): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor: ValorFormulario | undefined): number {
  const textoNumero = texto(valor).replace(",", ".");
  const numeroConvertido = Number(textoNumero);
  return Number.isFinite(numeroConvertido) ? numeroConvertido : 0;
}

function opcional(valor: ValorFormulario | undefined): string | null {
  const limpio = texto(valor);
  return limpio || null;
}

/* --------------------------------------------------------------- Bancos */
export async function listarBancosAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<Banco>> {
  const resultado = await ejecutarLectura(PERMISOS.bancoVer, ({ token }) =>
    listarBancos(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearBancoAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const nombre = texto(valores.nombre);
  if (!nombre) return { ok: false, mensaje: "El nombre del banco es obligatorio." };
  return ejecutarAccion(
    PERMISOS.bancoGestionar,
    async ({ token }) => {
      const respuesta = await crearBanco(token, {
        nombre,
        codigo_bc: texto(valores.codigo_bc) || undefined,
      });
      return respuesta.message || "Banco registrado correctamente.";
    },
    [RUTAS.catalogoBancos],
  );
}

export async function actualizarBancoAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.bancoGestionar,
    async ({ token }) => {
      const respuesta = await actualizarBanco(token, id, {
        nombre: texto(valores.nombre),
        codigo_bc: texto(valores.codigo_bc) || undefined,
      });
      return respuesta.message || "Banco actualizado correctamente.";
    },
    [RUTAS.catalogoBancos],
  );
}

export async function cambiarEstadoBancoAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.bancoGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoBanco(token, id);
      return respuesta.message || "Estado del banco actualizado.";
    },
    [RUTAS.catalogoBancos],
  );
}

/* --------------------------------------------------------- Dependencias */
export async function listarDependenciasAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<Dependencia>> {
  const resultado = await ejecutarLectura(PERMISOS.dependenciaVer, ({ token }) =>
    listarDependencias(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearDependenciaAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    codigo: texto(valores.codigo),
    nombre: texto(valores.nombre),
    abreviacion: texto(valores.abreviacion),
  };
  if (!datos.codigo || !datos.nombre || !datos.abreviacion) {
    return { ok: false, mensaje: "Código, nombre y abreviación son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.dependenciaGestionar,
    async ({ token }) => {
      const respuesta = await crearDependencia(token, datos);
      return respuesta.message || "Dependencia registrada correctamente.";
    },
    [RUTAS.catalogoDependencias],
  );
}

export async function actualizarDependenciaAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.dependenciaGestionar,
    async ({ token }) => {
      const respuesta = await actualizarDependencia(token, id, {
        codigo: texto(valores.codigo),
        nombre: texto(valores.nombre),
        abreviacion: texto(valores.abreviacion),
      });
      return respuesta.message || "Dependencia actualizada correctamente.";
    },
    [RUTAS.catalogoDependencias],
  );
}

export async function cambiarEstadoDependenciaAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.dependenciaGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoDependencia(token, id);
      return respuesta.message || "Estado de la dependencia actualizado.";
    },
    [RUTAS.catalogoDependencias],
  );
}

/* -------------------------------------------------------------- Cuentas */
export async function listarCuentasBancariasAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<CuentaBancaria>> {
  const resultado = await ejecutarLectura(
    PERMISOS.cuentaBancariaVer,
    ({ token }) => listarCuentasBancarias(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearCuentaBancariaAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    banco_id: texto(valores.banco_id),
    dependencia_id: opcional(valores.dependencia_id),
    nro_cuenta: texto(valores.nro_cuenta),
    nombre_cuenta: texto(valores.nombre_cuenta),
    tipo: texto(valores.tipo),
  };
  if (!datos.banco_id || !datos.nro_cuenta || !datos.nombre_cuenta || !datos.tipo) {
    return { ok: false, mensaje: "Banco, número, nombre y tipo son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.cuentaBancariaGestionar,
    async ({ token }) => {
      const respuesta = await crearCuentaBancaria(token, datos);
      return respuesta.message || "Cuenta bancaria registrada correctamente.";
    },
    [RUTAS.catalogoCuentas],
  );
}

export async function actualizarCuentaBancariaAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.cuentaBancariaGestionar,
    async ({ token }) => {
      const respuesta = await actualizarCuentaBancaria(token, id, {
        banco_id: texto(valores.banco_id),
        dependencia_id: opcional(valores.dependencia_id),
        nro_cuenta: texto(valores.nro_cuenta),
        nombre_cuenta: texto(valores.nombre_cuenta),
        tipo: texto(valores.tipo),
      });
      return respuesta.message || "Cuenta bancaria actualizada correctamente.";
    },
    [RUTAS.catalogoCuentas],
  );
}

export async function cambiarEstadoCuentaBancariaAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.cuentaBancariaGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoCuentaBancaria(token, id);
      return respuesta.message || "Estado de la cuenta actualizado.";
    },
    [RUTAS.catalogoCuentas],
  );
}

/* ------------------------------------------------------------- Intereses */
export async function listarInteresesAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<Interes>> {
  const resultado = await ejecutarLectura(PERMISOS.interesVer, ({ token }) =>
    listarIntereses(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearInteresAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const fecha = texto(valores.fecha_publicacion);
  const valor = numero(valores.valor);
  if (!fecha) return { ok: false, mensaje: "La fecha es obligatoria." };
  if (valor < 4 || valor > 8) {
    return { ok: false, mensaje: "El interés debe estar entre 4 y 8." };
  }
  return ejecutarAccion(
    PERMISOS.interesGestionar,
    async ({ token }) => {
      const respuesta = await crearInteres(token, {
        fecha_publicacion: fecha,
        valor,
      });
      return respuesta.message || "Interés registrado correctamente.";
    },
    [RUTAS.catalogoIntereses],
  );
}

export async function actualizarInteresAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.interesGestionar,
    async ({ token }) => {
      const respuesta = await actualizarInteres(token, id, {
        fecha_publicacion: texto(valores.fecha_publicacion),
        valor: numero(valores.valor),
      });
      return respuesta.message || "Interés actualizado correctamente.";
    },
    [RUTAS.catalogoIntereses],
  );
}

export async function cambiarEstadoInteresAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.interesGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoInteres(token, id);
      return respuesta.message || "Estado del interés actualizado.";
    },
    [RUTAS.catalogoIntereses],
  );
}

/* ------------------------------------------------------------ Calendario */
export async function listarCalendarioAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<Calendario>> {
  const resultado = await ejecutarLectura(PERMISOS.calendarioVer, ({ token }) =>
    listarCalendario(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearCalendarioAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const fecha = texto(valores.fecha);
  if (!fecha) return { ok: false, mensaje: "La fecha es obligatoria." };
  return ejecutarAccion(
    PERMISOS.calendarioGestionar,
    async ({ token }) => {
      const respuesta = await crearCalendario(token, {
        fecha,
        habil: valores.habil === true,
        descripcion: opcional(valores.descripcion),
      });
      return respuesta.message || "Fecha registrada correctamente.";
    },
    [RUTAS.catalogoCalendario],
  );
}

export async function actualizarCalendarioAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.calendarioGestionar,
    async ({ token }) => {
      const respuesta = await actualizarCalendario(token, id, {
        fecha: texto(valores.fecha),
        habil: valores.habil === true,
        descripcion: opcional(valores.descripcion),
      });
      return respuesta.message || "Fecha actualizada correctamente.";
    },
    [RUTAS.catalogoCalendario],
  );
}

export async function cambiarEstadoCalendarioAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.calendarioGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoCalendario(token, id);
      return respuesta.message || "Estado de la fecha actualizado.";
    },
    [RUTAS.catalogoCalendario],
  );
}

/* ---------------------------------------------------- Personas naturales */
export async function listarPersonasNaturalesAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<PersonaNatural>> {
  const resultado = await ejecutarLectura(
    PERMISOS.personaNaturalVer,
    ({ token }) => listarPersonasNaturales(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearPersonaNaturalAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    tipo_documento: texto(valores.tipo_documento),
    numero_documento: texto(valores.numero_documento),
    nombres: texto(valores.nombres),
    complemento: texto(valores.complemento),
    expedido: texto(valores.expedido),
    apellido_paterno: opcional(valores.apellido_paterno),
    apellido_materno: opcional(valores.apellido_materno),
    apellido_casada: opcional(valores.apellido_casada),
    domicilio: opcional(valores.domicilio),
    telefono: opcional(valores.telefono),
    email: opcional(valores.email),
    fecha_nacimiento: opcional(valores.fecha_nacimiento),
    estado_civil: "NO DECLARADO",
  };
  if (!datos.tipo_documento || !datos.numero_documento || !datos.nombres) {
    return { ok: false, mensaje: "Tipo y número de documento y nombres son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.personaNaturalGestionar,
    async ({ token }) => {
      const respuesta = await crearPersonaNatural(token, datos);
      return respuesta.message || "Persona natural registrada correctamente.";
    },
    [RUTAS.catalogoPersonasNaturales],
  );
}

export async function actualizarPersonaNaturalAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.personaNaturalGestionar,
    async ({ token }) => {
      const respuesta = await actualizarPersonaNatural(token, id, {
        tipo_documento: texto(valores.tipo_documento),
        numero_documento: texto(valores.numero_documento),
        nombres: texto(valores.nombres),
        complemento: texto(valores.complemento),
        expedido: texto(valores.expedido),
        apellido_paterno: opcional(valores.apellido_paterno),
        apellido_materno: opcional(valores.apellido_materno),
        apellido_casada: opcional(valores.apellido_casada),
        domicilio: opcional(valores.domicilio),
        telefono: opcional(valores.telefono),
        email: opcional(valores.email),
        fecha_nacimiento: opcional(valores.fecha_nacimiento),
      });
      return respuesta.message || "Persona natural actualizada correctamente.";
    },
    [RUTAS.catalogoPersonasNaturales],
  );
}

export async function cambiarEstadoPersonaNaturalAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.personaNaturalGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoPersonaNatural(token, id);
      return respuesta.message || "Estado de la persona actualizado.";
    },
    [RUTAS.catalogoPersonasNaturales],
  );
}

/* ---------------------------------------------------- Personas jurídicas */
export async function listarPersonasJuridicasAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<PersonaJuridica>> {
  const resultado = await ejecutarLectura(
    PERMISOS.personaJuridicaVer,
    ({ token }) => listarPersonasJuridicas(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearPersonaJuridicaAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    nit: texto(valores.nit),
    razon_social: texto(valores.razon_social),
    domicilio: opcional(valores.domicilio),
    telefono: opcional(valores.telefono),
    email: opcional(valores.email),
  };
  if (!datos.nit || !datos.razon_social) {
    return { ok: false, mensaje: "NIT y razón social son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.personaJuridicaGestionar,
    async ({ token }) => {
      const respuesta = await crearPersonaJuridica(token, datos);
      return respuesta.message || "Persona jurídica registrada correctamente.";
    },
    [RUTAS.catalogoPersonasJuridicas],
  );
}

export async function actualizarPersonaJuridicaAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.personaJuridicaGestionar,
    async ({ token }) => {
      const respuesta = await actualizarPersonaJuridica(token, id, {
        nit: texto(valores.nit),
        razon_social: texto(valores.razon_social),
        domicilio: opcional(valores.domicilio),
        telefono: opcional(valores.telefono),
        email: opcional(valores.email),
      });
      return respuesta.message || "Persona jurídica actualizada correctamente.";
    },
    [RUTAS.catalogoPersonasJuridicas],
  );
}

export async function cambiarEstadoPersonaJuridicaAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.personaJuridicaGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoPersonaJuridica(token, id);
      return respuesta.message || "Estado de la persona actualizado.";
    },
    [RUTAS.catalogoPersonasJuridicas],
  );
}

/* ------------------------------------------------------------- Requisitos */
export async function listarRequisitosCatalogoAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<RequisitoCatalogo>> {
  const resultado = await ejecutarLectura(PERMISOS.requisitoVer, ({ token }) =>
    listarRequisitosCatalogo(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearRequisitoCatalogoAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const datos = {
    codigo: texto(valores.codigo),
    descripcion: texto(valores.descripcion),
  };
  if (!datos.codigo || !datos.descripcion) {
    return { ok: false, mensaje: "Código y descripción son obligatorios." };
  }
  return ejecutarAccion(
    PERMISOS.requisitoGestionar,
    async ({ token }) => {
      const respuesta = await crearRequisitoCatalogo(token, datos);
      return respuesta.message || "Requisito registrado correctamente.";
    },
    [RUTAS.catalogoRequisitos],
  );
}

export async function actualizarRequisitoCatalogoAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.requisitoGestionar,
    async ({ token }) => {
      const respuesta = await actualizarRequisitoCatalogo(token, id, {
        codigo: texto(valores.codigo),
        descripcion: texto(valores.descripcion),
      });
      return respuesta.message || "Requisito actualizado correctamente.";
    },
    [RUTAS.catalogoRequisitos],
  );
}

export async function cambiarEstadoRequisitoCatalogoAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.requisitoGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoRequisitoCatalogo(token, id);
      return respuesta.message || "Estado del requisito actualizado.";
    },
    [RUTAS.catalogoRequisitos],
  );
}

/* ------------------------------------------------------------------- UFV */
export async function listarUfvAction(
  parametros: ParametrosListado,
): Promise<ResultadoListado<Ufv>> {
  const resultado = await ejecutarLectura(PERMISOS.ufvVer, ({ token }) =>
    listarUfv(token, parametros),
  );
  return resultado.ok
    ? { ok: true, pagina: resultado.datos }
    : { ok: false, mensaje: resultado.mensaje };
}

export async function crearUfvAction(
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  const fecha = texto(valores.fecha);
  const valor = numero(valores.valor);
  if (!fecha) return { ok: false, mensaje: "La fecha es obligatoria." };
  if (valor <= 0) return { ok: false, mensaje: "El valor de la UFV debe ser mayor a 0." };
  return ejecutarAccion(
    PERMISOS.ufvGestionar,
    async ({ token }) => {
      const respuesta = await crearUfv(token, { fecha, valor });
      return respuesta.message || "UFV registrada correctamente.";
    },
    [RUTAS.catalogoUfv],
  );
}

export async function actualizarUfvAction(
  id: string,
  valores: Record<string, ValorFormulario>,
): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.ufvGestionar,
    async ({ token }) => {
      const respuesta = await actualizarUfv(token, id, {
        fecha: texto(valores.fecha),
        valor: numero(valores.valor),
      });
      return respuesta.message || "UFV actualizada correctamente.";
    },
    [RUTAS.catalogoUfv],
  );
}

export async function cambiarEstadoUfvAction(id: string): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.ufvGestionar,
    async ({ token }) => {
      const respuesta = await cambiarEstadoUfv(token, id);
      return respuesta.message || "Estado de la UFV actualizado.";
    },
    [RUTAS.catalogoUfv],
  );
}

export async function sincronizarUfvAction(): Promise<ResultadoAccion> {
  return ejecutarAccion(
    PERMISOS.ufvGestionar,
    async ({ token }) => {
      const respuesta = await sincronizarUfv(token);
      return respuesta.message || "Sincronización de UFV ejecutada.";
    },
    [RUTAS.catalogoUfv],
  );
}
