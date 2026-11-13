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
  denegado: "/seguridad/denegado",
  usuarios: "/seguridad/usuarios",
  roles: "/seguridad/roles",
  modulos: "/seguridad/modulos",
  permisos: "/seguridad/permisos",
  sesiones: "/seguridad/sesiones",
} as const;

/** Códigos de los módulos funcionales de la fase 1. */
export const MODULOS = {
  usuarios: "USUARIOS",
  roles: "ROLES",
  modulos: "MODULOS",
  permisos: "PERMISOS",
  sesiones: "SESIONES",
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
