/**
 * Descarga de archivos generados por el backend (PDF y Excel).
 *
 * El nombre del archivo se toma del `Content-Disposition` de la respuesta, así
 * que el cliente no tiene que adivinarlo.
 */

/** Nombre del archivo indicado por el servidor, o el de respaldo. */
export function nombreDesdeContentDisposition(
  cabecera: string | null,
  porDefecto: string,
): string {
  if (!cabecera) return porDefecto;

  const conComillas = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cabecera);
  if (conComillas?.[1]) {
    try {
      return decodeURIComponent(conComillas[1].trim());
    } catch {
      return conComillas[1].trim();
    }
  }

  return porDefecto;
}

/** Dispara la descarga de un blob en el navegador. */
export function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  // Se libera el objeto URL en el siguiente ciclo para no cortar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Guarda la respuesta de un endpoint de exportación. Lanza un error con el
 * mensaje del backend si la respuesta no es correcta.
 */
export async function descargarRespuesta(
  respuesta: Response,
  nombrePorDefecto: string,
): Promise<void> {
  if (!respuesta.ok) {
    const texto = await respuesta.text();
    let mensaje = `No se pudo generar el archivo (${respuesta.status})`;
    try {
      const cuerpo: unknown = JSON.parse(texto);
      const posible = (cuerpo as { message?: string | string[] }).message;
      if (Array.isArray(posible)) mensaje = posible.join(", ");
      else if (typeof posible === "string") mensaje = posible;
    } catch {
      if (texto) mensaje = texto.slice(0, 300);
    }
    throw new Error(mensaje);
  }

  const nombre = nombreDesdeContentDisposition(
    respuesta.headers.get("Content-Disposition"),
    nombrePorDefecto,
  );
  descargarBlob(await respuesta.blob(), nombre);
}
