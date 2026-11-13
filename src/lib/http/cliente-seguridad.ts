import "server-only";

/**
 * Módulo: Seguridad / Infraestructura HTTP
 * Archivo: cliente-seguridad.ts
 *
 * Cliente HTTP exclusivo del servidor (Server Components, Server Actions y
 * Route Handlers). Centraliza la URL del backend, el envelope de respuesta,
 * los tiempos de espera y la traducción de errores.
 *
 * El JWT nunca se envía al navegador: viaja en una cookie httpOnly y este
 * cliente es el único punto que lo adjunta a las peticiones.
 */

/** Envelope estándar del backend (`ResponseInterceptor`). */
interface RespuestaApi<T> {
  success: boolean;
  status: number;
  data: T;
}

/** Cuerpo de error estándar de NestJS. */
interface CuerpoError {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

type ValorConsulta = string | number | boolean | null | undefined;

/** Opciones aceptadas por {@link solicitar}. */
export interface OpcionesSolicitud {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  query?: Record<string, ValorConsulta>;
  /**
   * En el login un 401 significa "credenciales inválidas", no "sesión
   * expirada"; esta bandera cambia esa interpretación.
   */
  credencialesInvalidasEn401?: boolean;
}

/**
 * Error tipado de una respuesta HTTP no exitosa del backend.
 *
 * `mensajeUsuario` es el único texto que debe mostrarse en la interfaz:
 * evita exponer rutas, SQL o detalles internos.
 */
export class ErrorApiSeguridad extends Error {
  constructor(
    readonly estado: number,
    readonly detalle: string,
    readonly cuerpo?: unknown,
  ) {
    super(detalle);
    this.name = "ErrorApiSeguridad";
  }

  /** Mensaje apto para la interfaz, alineado con el código HTTP. */
  get mensajeUsuario(): string {
    switch (this.estado) {
      case 400:
        return this.detalle || "Los datos enviados no son válidos.";
      case 401:
        return "Tu sesión expiró. Vuelve a iniciar sesión.";
      case 403:
        return "No tienes permisos para realizar esta operación.";
      case 404:
        return "El registro solicitado no existe.";
      case 409:
        return this.detalle || "Ya existe un registro con esos datos.";
      default:
        return "No se pudo completar la operación. Intenta nuevamente.";
    }
  }
}

/** El backend no respondió o devolvió un cuerpo inesperado. */
export class ErrorServicioSeguridad extends Error {
  constructor(mensaje = "No se pudo conectar con el servicio de seguridad.") {
    super(mensaje);
    this.name = "ErrorServicioSeguridad";
  }
}

/** La sesión ya no es válida (401 en una ruta autenticada). */
export class ErrorSesionExpirada extends Error {
  constructor() {
    super("La sesión expiró.");
    this.name = "ErrorSesionExpirada";
  }
}

/** URL base del backend, sin barra final. */
function urlBase(): string {
  const configurada =
    process.env.SECURITY_API_URL ??
    process.env.NEXT_PUBLIC_RECAUDACIONES_API_URL;

  if (!configurada) {
    throw new ErrorServicioSeguridad(
      "Falta configurar SECURITY_API_URL o NEXT_PUBLIC_RECAUDACIONES_API_URL.",
    );
  }

  return configurada.replace(/\/+$/, "");
}

/** Construye el querystring omitiendo valores vacíos. */
function construirConsulta(
  query: Record<string, ValorConsulta> | undefined,
): string {
  if (!query) return "";
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(query)) {
    if (valor === undefined || valor === null || valor === "") continue;
    parametros.set(clave, String(valor));
  }
  const cadena = parametros.toString();
  return cadena ? `?${cadena}` : "";
}

/** Lee el cuerpo sin fallar si el backend responde 204 o texto plano. */
async function leerCuerpo(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const tipo = response.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    const texto = await response.text();
    return texto ? { message: texto } : null;
  }
  return response.json().catch(() => null);
}

/** Extrae un mensaje legible de un cuerpo de error de NestJS. */
function mensajeDeError(cuerpo: unknown): string {
  if (!cuerpo || typeof cuerpo !== "object") return "";
  const datos = cuerpo as CuerpoError;
  if (Array.isArray(datos.message)) return datos.message.join(" ");
  return typeof datos.message === "string" ? datos.message : "";
}

/** Comprueba que el cuerpo sea el envelope esperado. */
function esEnvelope(valor: unknown): valor is RespuestaApi<unknown> {
  if (!valor || typeof valor !== "object") return false;
  const datos = valor as Record<string, unknown>;
  return datos.success === true && "data" in datos;
}

/**
 * Ejecuta una petición al backend y devuelve el contenido de `data`.
 *
 * @typeParam T Forma esperada de `data`.
 * @throws {ErrorSesionExpirada} Cuando la ruta autenticada responde 401.
 * @throws {ErrorApiSeguridad} Para el resto de respuestas no exitosas.
 * @throws {ErrorServicioSeguridad} Si no hay red o el cuerpo no es válido.
 */
export async function solicitar<T>(
  ruta: string,
  opciones: OpcionesSolicitud = {},
): Promise<T> {
  const {
    method = "GET",
    token,
    body,
    query,
    credencialesInvalidasEn401 = false,
  } = opciones;

  const url = `${urlBase()}${ruta.startsWith("/") ? ruta : `/${ruta}`}${construirConsulta(query)}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new ErrorServicioSeguridad();
  }

  const contenido = await leerCuerpo(response);

  if (!response.ok) {
    if (response.status === 401 && token && !credencialesInvalidasEn401) {
      throw new ErrorSesionExpirada();
    }
    throw new ErrorApiSeguridad(
      response.status,
      mensajeDeError(contenido),
      contenido,
    );
  }

  if (!esEnvelope(contenido)) {
    throw new ErrorServicioSeguridad(
      "El servicio de seguridad devolvió una respuesta inesperada.",
    );
  }

  return contenido.data as T;
}
