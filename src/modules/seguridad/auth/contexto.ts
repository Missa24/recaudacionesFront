import type {
  ContextoSesion,
  RolSesion,
  UsuarioSesion,
} from "./tipos";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: contexto.ts
 *
 * Utilidades puras de autorización sobre el contexto de sesión. No
 * dependen de Next.js ni del backend, por lo que pueden usarse tanto en
 * Server Components como en componentes cliente.
 */

/**
 * Indica si el contexto tiene un permiso concreto.
 *
 * Un superusuario recibe el comodín `"*"` al construir la sesión, por lo
 * que esta función no necesita conocer roles especiales.
 */
export function puedePermiso(
  contexto: ContextoSesion,
  codigoPermiso: string,
): boolean {
  return (
    contexto.permisos.includes("*") || contexto.permisos.includes(codigoPermiso)
  );
}

/** Indica si el contexto tiene acceso a un módulo por su código. */
export function tieneModulo(
  contexto: ContextoSesion,
  codigoModulo: string,
): boolean {
  return contexto.modulos.some((modulo) => modulo.codigo === codigoModulo);
}

/**
 * Indica si el contexto satisface al menos uno de los permisos indicados.
 * Un arreglo vacío se interpreta como "sin requisito".
 */
export function puedeAlguno(
  contexto: ContextoSesion,
  codigos: readonly string[],
): boolean {
  if (codigos.length === 0) return true;
  return codigos.some((codigo) => puedePermiso(contexto, codigo));
}

/** Códigos de rol activos, útil para reglas basadas en rol. */
export function codigosRol(contexto: ContextoSesion): string[] {
  return contexto.roles.map((rol) => rol.codigo);
}

/** Nombre legible del usuario, con respaldo en el username. */
export function nombreCompleto(usuario: UsuarioSesion): string {
  const partes = [
    usuario.nombres,
    usuario.apellido_paterno,
    usuario.apellido_materno,
  ]
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte));

  return partes.length > 0 ? partes.join(" ") : usuario.username;
}

/** Iniciales para el avatar del encabezado. */
export function inicialesUsuario(usuario: UsuarioSesion): string {
  const nombre = nombreCompleto(usuario);
  const palabras = nombre.split(/\s+/).filter(Boolean);
  const primera = palabras[0]?.[0] ?? "?";
  const segunda = palabras[1]?.[0] ?? "";
  return `${primera}${segunda}`.toUpperCase();
}

/** Descripción corta de los roles, para el encabezado. */
export function descripcionRoles(roles: RolSesion[]): string {
  if (roles.length === 0) return "Sin roles asignados";
  return roles.map((rol) => rol.descripcion).join(" · ");
}
