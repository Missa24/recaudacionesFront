import "server-only";

const api = process.env.API_TEMPLATE_URL;

export type OrganizationalUnit = {
  id: string;
  sourceId: string;
  name: string;
  acronym: string | null;
};

export type Employee = {
  ci: string;
  name: string;
  position: string | null;
  jobTitle: string | null;
  correoInstitucional?: string | null;
  immediateSupervisor: string | null;
  unit: string | null;
  unitSourceId: string | null;
};

export type CrudItem = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  organizationalUnitId: string | null;
  employeeCi: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrudInput = Pick<CrudItem, "name" | "description" | "status">;

export type Catalog = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RequestStatus = "active" | "inactive";
export type Solicitud = {
  id: string;
  title: string;
  description: string | null;
  catalogoId: string;
  catalogo: Catalog;
  status: RequestStatus;
  employeeCi: string | null;
  employeeName: string | null;
  employeePosition: string | null;
  employeeJobTitle: string | null;
  originUnitName: string | null;
  destinationUnitId: string | null;
  destinationUnitName: string | null;
  destinationUnitAcronym: string | null;
  requestDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestInput = Pick<
  Solicitud,
  "title" | "description" | "catalogoId"
> & {
  employeeCi: string;
  destinationUnitId: string;
  requestDate: string;
  status: RequestStatus;
  funcionario_email?: string | null;
  inmediato_superior_email?: string | null;
  inmediato_superior?: string | null;
};
export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

async function request<T>(
  path: string,
  init: Pick<RequestInit, "method" | "body"> = {},
): Promise<T> {
  if (!api) throw new Error("Falta configurar API_TEMPLATE_URL.");
  let response: Response;
  try {
    response = await fetch(`${api.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    throw new Error("API Template no está disponible.");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    throw new Error(
      typeof message === "string"
        ? message
        : "No se pudo consultar API Template.",
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const listOrganizationalUnits = () =>
  request<OrganizationalUnit[]>("/wara/organizational-units");
export const findEmployeeByCi = (ci: string) =>
  request<Employee>(`/capibara/employees/ci/${encodeURIComponent(ci)}`);
export const listCrudItems = () => request<CrudItem[]>("/crud");
export const createCrudItem = (input: CrudInput) =>
  request<CrudItem>("/crud", { method: "POST", body: JSON.stringify(input) });
export const updateCrudItem = (id: string, input: CrudInput) =>
  request<CrudItem>(`/crud/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const deleteCrudItem = (id: string) =>
  request<void>(`/crud/${encodeURIComponent(id)}`, { method: "DELETE" });

export const listCatalogs = () =>
  request<Paginated<Catalog>>("/catalogos?limit=100");
export const listRequests = () => request<Solicitud[]>("/solicitudes");
export const createRequest = (input: RequestInput) =>
  request<Solicitud>("/solicitudes", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateRequest = (id: string, input: RequestInput) =>
  request<Solicitud>(`/solicitudes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const deleteRequest = (id: string) =>
  request<void>(`/solicitudes/${encodeURIComponent(id)}`, { method: "DELETE" });
