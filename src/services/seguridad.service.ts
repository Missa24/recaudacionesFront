import "server-only";

const api =
  process.env.SECURITY_API_URL ??
  process.env.NEXT_PUBLIC_RECAUDACIONES_API_URL;
const systemCode = process.env.SECURITY_SYSTEM_CODE ?? "PLATFORM_TEMPLATE";
const enabledModuleCodes = new Set(
  (process.env.SECURITY_MODULE_CODES ?? "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean),
);

function apiUrl(path: string): string {
  if (!api)
    throw new Error(
      "Falta configurar SECURITY_API_URL o NEXT_PUBLIC_RECAUDACIONES_API_URL.",
    );
  return `${api.replace(/\/$/, "")}${path}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function responsePayload(body: unknown): Record<string, unknown> | null {
  const record = asRecord(body);
  if (!record) return null;
  if (!("data" in record)) return record;
  if (record.success !== true) return null;
  return asRecord(record.data);
}

export type LoginResult =
  | {
      status: "ok";
      token: string;
      expiresAt: Date;
      user: { username: string; name: string; email: string | null };
    }
  | { status: "invalid" }
  | { status: "unavailable" };

export type LdapUserProfile = {
  username: string;
  displayName: string | null;
  phone: string | null;
  mobile: string | null;
  manager: string | null;
};

export async function authenticate(
  username: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(apiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if ([400, 401, 403].includes(response.status)) return { status: "invalid" };
    if (!response.ok) return { status: "unavailable" };
    const result = responsePayload(await response.json());
    if (!result) return { status: "unavailable" };
    const user = asRecord(result.user);
    const expiresAt = new Date(String(result.expires_at));
    if (
      typeof result.access_token !== "string" ||
      !result.access_token ||
      typeof user?.username !== "string" ||
      !user.username ||
      !Number.isFinite(expiresAt.getTime()) ||
      expiresAt.getTime() <= Date.now()
    ) {
      return { status: "unavailable" };
    }
    return {
      status: "ok",
      token: result.access_token,
      expiresAt,
      user: {
        username: user.username,
        name:
          typeof user.name === "string" && user.name.trim()
            ? user.name.trim()
            : user.username,
        email:
          typeof user.email === "string" && user.email.trim()
            ? user.email.trim()
            : null,
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}

export async function getLdapUserProfile(
  token: string,
  username: string,
): Promise<LdapUserProfile | null> {
  try {
    const response = await fetch(
      apiUrl(`/auth/user/${encodeURIComponent(username)}`),
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as {
      success?: unknown;
      data?: {
        username?: unknown;
        displayName?: unknown;
        phone?: unknown;
        mobile?: unknown;
        manager?: unknown;
      };
    };
    if (body.success !== true || !body.data) return null;
    const text = (value: unknown) =>
      typeof value === "string" && value.trim() ? value.trim() : null;
    return {
      username: text(body.data.username) ?? username,
      displayName: text(body.data.displayName),
      phone: text(body.data.phone),
      mobile: text(body.data.mobile),
      manager: text(body.data.manager),
    };
  } catch {
    return null;
  }
}

export async function validateToken(
  token: string,
): Promise<"ok" | "invalid" | "unavailable"> {
  try {
    const response = await fetch(apiUrl("/auth/validate-token"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401 || response.status === 403) return "invalid";
    if (!response.ok) return "unavailable";
    const body = responsePayload(await response.json());
    const user = asRecord(body?.user);
    return body?.valid === true &&
      typeof user?.username === "string"
      ? "ok"
      : "unavailable";
  } catch {
    return "unavailable";
  }
}

type System = {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
};
type User = { id: string; activo: boolean; estado: string };
type Assignment = {
  rolId: string;
  sistemaId: string | null;
  activo: boolean;
  _deletedAt?: string | null;
  rol?: { activo: boolean };
  sistema?: System;
};
type Module = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  ruta?: string | null;
  icono?: string | null;
  orden: number;
  activo: boolean;
};
type Permission = {
  permiso: string;
  sistemaId: string;
  moduloId: string;
  rolId: string;
  activo: boolean;
  permitido: boolean;
};

export type SecurityNavigationModule = Pick<
  Module,
  "id" | "codigo" | "nombre" | "descripcion" | "ruta" | "icono" | "orden"
>;

export type SecurityNavigationSystem = Pick<
  System,
  "id" | "codigo" | "nombre"
> & {
  modules: SecurityNavigationModule[];
};

async function getIdentity(token: string): Promise<string> {
  const identity = await fetch(apiUrl("/auth/validate-token"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!identity.ok) throw new Error("No se pudo validar la sesión.");
  const body = responsePayload(await identity.json());
  const user = asRecord(body?.user);
  if (body?.valid !== true || typeof user?.username !== "string") {
    throw new Error("Sesión inválida.");
  }
  return user.username;
}

async function readWithToken<T>(
  token: string,
  path: string,
): Promise<T | null> {
  const response = await fetch(apiUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("No se pudo consultar Seguridad.");
  return response.json() as Promise<T>;
}

export async function getPermissions(token: string): Promise<Set<string>> {
  const username = await getIdentity(token);
  const [system, user] = await Promise.all([
    readWithToken<System>(
      token,
      `/sistemas/codigo/${encodeURIComponent(systemCode)}`,
    ),
    readWithToken<User>(
      token,
      `/usuarios/username/${encodeURIComponent(username)}`,
    ),
  ]);
  if (!system?.activo || !user?.activo || user.estado !== "ACTIVO")
    return new Set();
  const [assignments, modules, permissions] = await Promise.all([
    readWithToken<Assignment[]>(token, `/usuarios-roles/usuario/${user.id}`),
    readWithToken<Module[]>(
      token,
      `/modulos-sistema/sistema/${system.id}/activos`,
    ),
    readWithToken<Permission[]>(
      token,
      `/permisos-acceso/usuario/${user.id}?sistemaId=${system.id}`,
    ),
  ]);
  if (
    !Array.isArray(assignments) ||
    !Array.isArray(modules) ||
    !Array.isArray(permissions)
  ) {
    throw new Error("Respuesta inválida de Seguridad.");
  }
  const roles = new Set(
    assignments
      .filter(
        (item) =>
          item.sistemaId === system.id && item.activo && item.rol?.activo,
      )
      .map((item) => item.rolId),
  );
  const moduleIds = new Set(
    modules
      .filter(
        (item) =>
          item.activo &&
          (enabledModuleCodes.size === 0 ||
            enabledModuleCodes.has(item.codigo.toUpperCase())),
      )
      .map((item) => item.id),
  );
  return new Set(
    permissions
      .filter(
        (item) =>
          item.sistemaId === system.id &&
          moduleIds.has(item.moduloId) &&
          roles.has(item.rolId) &&
          item.activo &&
          item.permitido,
      )
      .map((item) => item.permiso),
  );
}

export async function getSecurityNavigation(
  token: string,
): Promise<SecurityNavigationSystem[]> {
  const username = await getIdentity(token);
  const user = await readWithToken<User>(
    token,
    `/usuarios/username/${encodeURIComponent(username)}`,
  );
  if (!user?.activo || user.estado !== "ACTIVO") return [];

  const assignments = await readWithToken<Assignment[]>(
    token,
    `/usuarios-roles/usuario/${user.id}`,
  );
  if (!Array.isArray(assignments))
    throw new Error("Respuesta inválida de Seguridad.");

  const activeAssignments = assignments.filter(
    (item) =>
      item.activo &&
      !item._deletedAt &&
      item.rol?.activo &&
      item.sistemaId &&
      item.sistema?.activo,
  );
  const systems = new Map<string, System>();
  for (const assignment of activeAssignments) {
    if (assignment.sistema)
      systems.set(assignment.sistema.id, assignment.sistema);
  }

  const navigation = await Promise.all(
    [...systems.values()].map(async (system) => {
      const [modules, permissions] = await Promise.all([
        readWithToken<Module[]>(
          token,
          `/modulos-sistema/sistema/${system.id}/activos`,
        ),
        readWithToken<Permission[]>(
          token,
          `/permisos-acceso/usuario/${user.id}?sistemaId=${system.id}`,
        ),
      ]);
      if (!Array.isArray(modules) || !Array.isArray(permissions)) {
        throw new Error("Respuesta inválida de Seguridad.");
      }

      const roleIds = new Set(
        activeAssignments
          .filter((item) => item.sistemaId === system.id)
          .map((item) => item.rolId),
      );
      const allowedModuleIds = new Set(
        permissions
          .filter(
            (item) =>
              item.sistemaId === system.id &&
              roleIds.has(item.rolId) &&
              item.activo &&
              item.permitido,
          )
          .map((item) => item.moduloId),
      );

      return {
        id: system.id,
        codigo: system.codigo,
        nombre: system.nombre,
        modules: modules
          .filter((module) => module.activo && allowedModuleIds.has(module.id))
          .sort((left, right) => left.orden - right.orden)
          .map(({ id, codigo, nombre, descripcion, ruta, icono, orden }) => ({
            id,
            codigo,
            nombre,
            descripcion,
            ruta,
            icono,
            orden,
          })),
      };
    }),
  );

  return navigation
    .filter((system) => system.modules.length > 0)
    .sort((left, right) => left.nombre.localeCompare(right.nombre, "es"));
}
