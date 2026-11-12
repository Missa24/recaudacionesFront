import "server-only";

import { jwtVerify, SignJWT } from "jose";
import {
  findEmployeeDirectByCi,
  type Employee,
} from "./capibara.service";
import {
  getLdapUserProfile,
  type LdapUserProfile,
} from "./seguridad.service";

export type UserProfile = {
  fullName: string;
  username: string;
  ci: string | null;
  rrhh: Employee | null;
  updatedAt: string;
  /**
   * Categoría de viático publicada por el sistema de Seguridad. Puede llegar
   * como identificador, código o nombre: el módulo de viáticos la resuelve
   * contra su propio catálogo.
   *
   * Se guarda en la cookie firmada `platform_session_profile` y **se conserva
   * al leerla**; si no se copiara en `verifyUserProfile`, el cliente nunca la
   * vería.
   */
  categoria_viatico?: string | null;
};

/**
 * Lee la categoría de viático de una respuesta del sistema externo.
 *
 * Se prueban varios nombres de campo porque el dato viene de Seguridad/Capibara
 * y no está tipado. Si el origen cambia de nombre, este es el único lugar a
 * ajustar.
 *
 * @param origen Respuesta cruda (perfil de LDAP o empleado de Capibara).
 * @returns El valor como texto sin espacios sobrantes, o `null` si no viene.
 */
function leerCategoriaViatico(origen: unknown): string | null {
  if (!origen || typeof origen !== "object") return null;

  const datos = origen as Record<string, unknown>;
  const candidatos = [
    datos.categoria_viatico,
    datos.categoriaViatico,
    datos.categoriaViaticoId,
    datos.categoria_viatico_id,
    datos.codigoCategoria,
  ];

  for (const valor of candidatos) {
    if (typeof valor === "string" && valor.trim()) return valor.trim();
    if (typeof valor === "number" && Number.isFinite(valor)) {
      return String(valor);
    }
  }

  return null;
}

type AuthenticatedIdentity = {
  username: string;
  name: string;
};

async function employeeByCi(ci: string | null): Promise<Employee | null> {
  if (!ci) return null;
  try {
    return await findEmployeeDirectByCi(ci);
  } catch {
    return null;
  }
}

export async function buildUserProfile(
  identity: AuthenticatedIdentity,
  token: string,
): Promise<UserProfile> {
  const ldap: LdapUserProfile | null = await getLdapUserProfile(
    token,
    identity.username,
  );
  const ci = (ldap?.phone ?? ldap?.mobile)?.replace(/\s+/g, "") || null;
  const employee = await employeeByCi(ci);
  const employeeName = employee
    ? [employee.nombres, employee.primerApellido, employee.segundoApellido]
        .filter(Boolean)
        .join(" ")
    : null;

  return {
    fullName:
      employeeName || ldap?.displayName || identity.name || identity.username,
    username: identity.username,
    ci,
    rrhh: employee,
    updatedAt: new Date().toISOString(),
    // La categoría puede venir en el perfil de Seguridad o en los datos del
    // empleado; se guarda el primer valor utilizable.
    categoria_viatico:
      leerCategoriaViatico(ldap) ?? leerCategoriaViatico(employee),
  };
}

export async function signUserProfile(
  profile: UserProfile,
  token: string,
  expiresAt: Date,
): Promise<string> {
  return new SignJWT({ profile })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(new TextEncoder().encode(token));
}

export async function verifyUserProfile(
  signedProfile: string,
  token: string,
): Promise<UserProfile | null> {
  try {
    const { payload } = await jwtVerify(
      signedProfile,
      new TextEncoder().encode(token),
    );
    const profile = payload.profile as Partial<UserProfile> | undefined;
    if (
      !profile ||
      typeof profile.fullName !== "string" ||
      typeof profile.username !== "string" ||
      typeof profile.updatedAt !== "string"
    ) {
      return null;
    }
    const nullableText = (value: unknown) =>
      typeof value === "string" && value.trim() ? value : null;
    const rrhh =
      profile.rrhh &&
      typeof profile.rrhh === "object" &&
      typeof profile.rrhh.ci === "string" &&
      typeof profile.rrhh.nombres === "string"
        ? profile.rrhh
        : null;
    return {
      fullName: profile.fullName,
      username: profile.username,
      ci: nullableText(profile.ci),
      rrhh,
      updatedAt: profile.updatedAt,
      // Se conserva la categoría de viático del perfil firmado: sin esta copia
      // el dato se perdería al leer la cookie.
      categoria_viatico: nullableText(profile.categoria_viatico),
    };
  } catch {
    return null;
  }
}
