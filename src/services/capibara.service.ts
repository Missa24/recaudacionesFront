import "server-only";

export type SupervisorEmployee = {
  idUsuario: string | null;
  idPersona: string | null;
  ci: string | null;
  nombres: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  nombreUsuario: string | null;
  correoInstitucional: string | null;
  correoPersonal: string | null;
  celular: string | null;
  idUnidadOrganizacional: string | null;
  unidadOrganizacional: string | null;
  idPuesto: string | null;
  puesto: string | null;
  idEscalaSalarial: string | null;
  cargo: string | null;
  codigoCategoria: string | null;
  tipoEmpleado: string | null;
  nroItem: string | null;
};

export type Employee = Omit<SupervisorEmployee, "ci"> & {
  ci: string;
  inmediatoSuperior: string | null;
  inmediatoSuperiorNombreUsuario: string | null;
  inmediatoSuperiorDatos: SupervisorEmployee | null;
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : null;
}

function text(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

function nestedName(value: unknown): string | null {
  const item = record(value);
  if (!item) return text(value);
  return text(
    item.name,
    item.nombre,
    item.nombreCompleto,
    item.descripcion,
  );
}

function normalizeEmployee(value: unknown, requestedCi: string): Employee {
  const employee = record(value);
  if (!employee) throw new Error("Respuesta inválida de Capibara.");

  const unitValue =
    employee.unit ??
    employee.unidad ??
    employee.organizationalUnit ??
    employee.unidadOrganizacional;
  const unit = record(unitValue);
  const supervisorValue =
    employee.immediateSupervisor ??
    employee.inmediatoSuperior ??
    employee.jefeInmediato ??
    employee.supervisor;
  const supervisorData = record(employee.inmediatoSuperiorDatos);

  const firstNames = text(employee.firstNames, employee.nombres);
  const firstLastName = text(employee.firstLastName, employee.primerApellido);
  const secondLastName = text(
    employee.secondLastName,
    employee.segundoApellido,
  );
  if (!firstNames) {
    throw new Error("Capibara no devolvió los nombres del funcionario.");
  }

  return {
    idUsuario: text(employee.idUsuario),
    idPersona: text(employee.idPersona),
    ci:
      text(
        employee.ci,
        employee.nroDocumento,
        employee.numeroDocumento,
        employee.documento,
      ) ?? requestedCi,
    nombres: firstNames,
    primerApellido: firstLastName,
    segundoApellido: secondLastName,
    nombreUsuario: text(employee.username, employee.nombreUsuario),
    correoInstitucional: text(
      employee.institutionalEmail,
      employee.correoInstitucional,
    ),    
    correoPersonal: text(employee.personalEmail, employee.correoPersonal),
    celular: text(employee.mobile, employee.celular),
    idUnidadOrganizacional: text(employee.idUnidadOrganizacional),
    unidadOrganizacional: text(
      employee.unidadOrganizacional,
      employee.unit,
      employee.unidad,
      employee.nombreUnidad,
      unit?.name,
      unit?.nombre,
    ),
    idPuesto: text(employee.idPuesto),
    puesto: text(
      employee.position,
      employee.puesto,
      employee.nombrePuesto,
    ),
    idEscalaSalarial: text(employee.idEscalaSalarial),
    cargo: text(
      employee.jobTitle,
      employee.cargo,
      employee.nombreCargo,
    ),
    codigoCategoria: text(employee.categoryCode, employee.codigoCategoria),
    tipoEmpleado: text(employee.employeeType, employee.tipoEmpleado),
    nroItem: text(employee.itemNumber, employee.nroItem),
    inmediatoSuperior: nestedName(supervisorValue),
    inmediatoSuperiorNombreUsuario: text(
      employee.inmediatoSuperiorNombreUsuario,
    ),
    inmediatoSuperiorDatos: supervisorData
      ? {
          idUsuario: text(supervisorData.idUsuario),
          idPersona: text(supervisorData.idPersona),
          ci: text(supervisorData.ci),
          nombres: text(supervisorData.nombres),
          primerApellido: text(supervisorData.primerApellido),
          segundoApellido: text(supervisorData.segundoApellido),
          nombreUsuario: text(supervisorData.nombreUsuario),
          correoInstitucional: text(supervisorData.correoInstitucional),
          correoPersonal: text(supervisorData.correoPersonal),
          celular: text(supervisorData.celular),
          idUnidadOrganizacional: text(
            supervisorData.idUnidadOrganizacional,
          ),
          unidadOrganizacional: text(supervisorData.unidadOrganizacional),
          idPuesto: text(supervisorData.idPuesto),
          puesto: text(supervisorData.puesto),
          idEscalaSalarial: text(supervisorData.idEscalaSalarial),
          cargo: text(supervisorData.cargo),
          codigoCategoria: text(supervisorData.codigoCategoria),
          tipoEmpleado: text(supervisorData.tipoEmpleado),
          nroItem: text(supervisorData.nroItem),
        }
      : null,
  };
}

/**
 * Recupera el perfil laboral consolidado desde el endpoint de Capibara.
 * Se ejecuta exclusivamente en el servidor de Next.js.
 */
export async function findEmployeeDirectByCi(ci: string): Promise<Employee> {
  const document = ci.trim();
  if (!/^[0-9A-Za-z-]{4,20}$/.test(document))
    throw new Error("CI inválido.");

  const api = process.env.CAPIBARA_API_URL;
  const token = process.env.CAPIBARA_API_TOKEN;
  if (!api || !token) throw new Error("Integración Capibara no configurada.");

  let response: Response;
  try {
    response = await fetch(
      `${api.replace(/\/$/, "")}/v1/capibara/employees/ci/${encodeURIComponent(document)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(7000),
      },
    );
  } catch {
    throw new Error("Capibara no disponible.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Capibara rechazó el token o no autorizó el endpoint de empleados.",
    );
  }
  if (response.status === 404) throw new Error("Funcionario no encontrado.");
  if (!response.ok) throw new Error("No se pudo consultar Capibara.");

  const body = (await response.json().catch(() => null)) as unknown;
  const envelope = record(body);
  if (!envelope) throw new Error("Respuesta inválida de Capibara.");
  if (envelope.finalizado === false) {
    throw new Error(text(envelope.mensaje) ?? "Capibara rechazó la consulta.");
  }

  return normalizeEmployee(envelope.datos ?? body, document);
}
