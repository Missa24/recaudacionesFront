/**
 * Formato y lectura de montos.
 *
 * Antes cada pantalla formateaba el dinero por su cuenta (había dos
 * implementaciones distintas). Acá queda una sola, en formato boliviano:
 * separador de miles punto y decimal coma.
 */

const FORMATO_MONTO = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Monto legible: `1234.5` → `1.234,50`. Vacío si no hay valor. */
export function formatearMonto(valor?: number | string | null): string {
  const numero = aNumero(valor);
  if (numero === null) return "";
  return FORMATO_MONTO.format(numero);
}

/** Monto con el prefijo de moneda. */
export function formatearMontoConMoneda(
  valor?: number | string | null,
  moneda = "Bs",
): string {
  const texto = formatearMonto(valor);
  return texto ? `${moneda} ${texto}` : "";
}

/** Número utilizable, o `null` si el valor no representa un número. */
export function aNumero(valor?: number | string | null): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Interpreta lo que escribió el usuario.
 *
 * Acepta `1.234,56` (formato local), `1234,56`, `1234.56` y `1234`. Un punto
 * con exactamente uno o dos decimales se toma como decimal; si no, como
 * separador de miles. Devuelve `null` si no se puede interpretar.
 */
export function parsearMonto(entrada: string): number | null {
  const limpio = (entrada ?? "")
    .replace(/[^\d.,-]/g, "")
    .trim();

  if (!limpio) return null;

  const tieneComa = limpio.includes(",");
  const tienePunto = limpio.includes(".");

  let normalizado: string;

  if (tieneComa && tienePunto) {
    // El último separador que aparece es el decimal.
    normalizado =
      limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
        ? limpio.replace(/\./g, "").replace(",", ".")
        : limpio.replace(/,/g, "");
  } else if (tieneComa) {
    normalizado = limpio.replace(",", ".");
  } else if (tienePunto) {
    const partes = limpio.split(".");
    const decimales = partes[partes.length - 1];
    normalizado =
      partes.length === 2 && decimales.length > 0 && decimales.length <= 2
        ? limpio
        : limpio.replace(/\./g, "");
  } else {
    normalizado = limpio;
  }

  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) return null;
  return redondear(numero, 2);
}

/** Redondeo a la cantidad de decimales indicada. */
export function redondear(valor: number, decimales = 2): number {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

/**
 * Calcula el IVA de un monto según el porcentaje indicado y el líquido
 * pagable resultante. Es la misma cuenta que muestra el reporte del backend.
 */
export function calcularIva(
  montoTotal?: number | string | null,
  porcentaje = 13,
): { montoTotal: number; montoIva: number; montoLiquidoPagable: number } {
  const total = aNumero(montoTotal) ?? 0;
  const tasa = aNumero(porcentaje) ?? 0;
  const iva = redondear((total * tasa) / 100, 2);
  return {
    montoTotal: redondear(total, 2),
    montoIva: iva,
    montoLiquidoPagable: redondear(total - iva, 2),
  };
}
