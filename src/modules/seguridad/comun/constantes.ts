/**
 * Módulo: Seguridad / Común
 * Archivo: constantes.ts
 *
 * Única fuente de verdad para nombres de cookies, rutas internas,
 * códigos de módulos y códigos de permisos.
 *
 * Los códigos siguen el estilo del catálogo del backend
 * (`modulo.codigo` y `permiso.codigo`, en mayúsculas y guion bajo).
 * Si el catálogo sembrado en base de datos usa otros nombres, basta con
 * ajustar este archivo y el script `docs/seguridad/seed-fase1.sql`.
 */

/** Nombre base de la cookie que guarda el JWT del backend. */
export const COOKIE_TOKEN = process.env.AUTH_COOKIE_NAME ?? "recaudacion_session";

/** Cookie firmada con el contexto de autorización del usuario. */
export const COOKIE_CONTEXTO = `${COOKIE_TOKEN}_contexto`;

/** Rutas internas del frontend. */
export const RUTAS = {
  inicio: "/",
  login: "/login",
  seguridad: "/seguridad",
  denegado: "/denegado",
  usuarios: "/seguridad/usuarios",
  roles: "/seguridad/roles",
  modulos: "/seguridad/modulos",
  permisos: "/seguridad/permisos",
  sesiones: "/seguridad/sesiones",
  catalogo: "/catalogo",
  catalogoBancos: "/catalogo/bancos",
  catalogoCuentas: "/catalogo/cuentas-bancarias",
  catalogoDependencias: "/catalogo/dependencias",
  catalogoIntereses: "/catalogo/intereses",
  catalogoCalendario: "/catalogo/calendario",
  catalogoPersonasNaturales: "/catalogo/personas-naturales",
  catalogoPersonasJuridicas: "/catalogo/personas-juridicas",
  catalogoRequisitos: "/catalogo/requisitos",
  catalogoUfv: "/catalogo/ufv",
  arancel: "/arancel",
  arancelTiposTramite: "/arancel/tipos-tramite",
  arancelGenerales: "/arancel/aranceles",
  arancelDetalles: "/arancel/detalles",
  arancelTarifas: "/arancel/tarifas",
  arancelRangos: "/arancel/rangos",
  arancelRequisitos: "/arancel/requisitos",
} as const;

/** Códigos de los módulos funcionales de la fase 1. */
export const MODULOS = {
  usuarios: "USUARIOS",
  roles: "ROLES",
  modulos: "MODULOS",
  permisos: "PERMISOS",
  sesiones: "SESIONES",
  catalogos: "CATALOGOS",
  aranceles: "ARANCELES",
} as const;

/**
 * Códigos de permisos usados por las pantallas y acciones de la fase 1.
 *
 * El backend no impone estos códigos: son datos del catálogo `seguridad.permiso`.
 * La constante evita cadenas mágicas repartidas por el código.
 */
export const PERMISOS = {
  usuarioVer: "USUARIO_VER",
  usuarioCrear: "USUARIO_CREAR",
  usuarioEditar: "USUARIO_EDITAR",
  usuarioEstado: "USUARIO_ESTADO",
  usuarioAsignarRol: "USUARIO_ASIGNAR_ROL",
  rolVer: "ROL_VER",
  rolCrear: "ROL_CREAR",
  rolEditar: "ROL_EDITAR",
  rolEstado: "ROL_ESTADO",
  rolAsignarPermiso: "ROL_ASIGNAR_PERMISO",
  moduloVer: "MODULO_VER",
  moduloCrear: "MODULO_CREAR",
  moduloEditar: "MODULO_EDITAR",
  moduloEstado: "MODULO_ESTADO",
  permisoVer: "PERMISO_VER",
  permisoCrear: "PERMISO_CREAR",
  permisoEditar: "PERMISO_EDITAR",
  permisoEstado: "PERMISO_ESTADO",
  sesionVer: "SESION_VER",
  sesionCerrar: "SESION_CERRAR",

  // Catálogos maestros (fase 2). `VER` consulta; `GESTIONAR` crea, edita y
  // cambia estado. El seed de la fase 2 registra estos códigos.
  bancoVer: "BANCO_VER",
  bancoGestionar: "BANCO_GESTIONAR",
  cuentaBancariaVer: "CUENTA_BANCARIA_VER",
  cuentaBancariaGestionar: "CUENTA_BANCARIA_GESTIONAR",
  dependenciaVer: "DEPENDENCIA_VER",
  dependenciaGestionar: "DEPENDENCIA_GESTIONAR",
  interesVer: "INTERES_VER",
  interesGestionar: "INTERES_GESTIONAR",
  calendarioVer: "CALENDARIO_VER",
  calendarioGestionar: "CALENDARIO_GESTIONAR",
  personaNaturalVer: "PERSONA_NATURAL_VER",
  personaNaturalGestionar: "PERSONA_NATURAL_GESTIONAR",
  personaJuridicaVer: "PERSONA_JURIDICA_VER",
  personaJuridicaGestionar: "PERSONA_JURIDICA_GESTIONAR",
  requisitoVer: "REQUISITO_VER",
  requisitoGestionar: "REQUISITO_GESTIONAR",
  ufvVer: "UFV_VER",
  ufvGestionar: "UFV_GESTIONAR",

  // Aranceles (fase 2).
  tipoTramiteVer: "TIPO_TRAMITE_VER",
  tipoTramiteGestionar: "TIPO_TRAMITE_GESTIONAR",
  arancelGeneralVer: "ARANCEL_GENERAL_VER",
  arancelGeneralGestionar: "ARANCEL_GENERAL_GESTIONAR",
  arancelDetalleVer: "ARANCEL_DETALLE_VER",
  arancelDetalleGestionar: "ARANCEL_DETALLE_GESTIONAR",
  tarifaVer: "TARIFA_VER",
  tarifaGestionar: "TARIFA_GESTIONAR",
  arancelRangoVer: "ARANCEL_RANGO_VER",
  arancelRangoGestionar: "ARANCEL_RANGO_GESTIONAR",
  arancelRequisitoVer: "ARANCEL_REQUISITO_VER",
  arancelRequisitoGestionar: "ARANCEL_REQUISITO_GESTIONAR",
} as const;

/**
 * Roles que, por configuración, reciben acceso total (`permisos: ["*"]`).
 *
 * Es una válvula de arranque para que el primer administrador pueda
 * sembrar el catálogo. En producción puede restringirse con la variable
 * `SECURITY_SUPER_ROLE_CODES` (lista separada por comas).
 */
export function codigosRolSuperusuario(): string[] {
  const configurados = process.env.SECURITY_SUPER_ROLE_CODES;
  const base = configurados?.trim() ? configurados : "ADMIN,ADMINISTRADOR,SUPER_ADMIN";
  return base
    .split(",")
    .map((codigo) => codigo.trim().toUpperCase())
    .filter(Boolean);
}

/** Mensajes genéricos para no filtrar detalles internos del backend. */
export const MENSAJES = {
  credenciales: "Usuario o contraseña incorrectos.",
  sinAcceso: "Tu usuario no tiene acceso al sistema de recaudaciones.",
  servicio: "No se pudo conectar con el servicio de seguridad. Intenta nuevamente.",
  sesionExpirada: "Tu sesión expiró. Vuelve a iniciar sesión.",
  sinPermiso: "No tienes permisos para realizar esta operación.",
  inesperado: "Ocurrió un error inesperado. Intenta nuevamente.",
} as const;
