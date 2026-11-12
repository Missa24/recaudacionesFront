/**
 * Tamaño de archivo legible.
 *
 * Se usa para avisar el peso de las imágenes antes y después de subirlas, con
 * el mismo criterio que el backend (1 MB = 1024 KB).
 */
export function formatearBytes(bytes?: number | null): string {
  const valor = Number(bytes ?? 0);
  if (!Number.isFinite(valor) || valor <= 0) return "0 KB";
  if (valor < 1024) return `${valor} B`;

  const kb = valor / 1024;
  if (kb < 1024) return `${kb % 1 === 0 ? kb : kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
}
