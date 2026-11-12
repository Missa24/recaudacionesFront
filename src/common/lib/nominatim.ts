/**
 * Cliente para el servicio de geocodificación gratuito Nominatim (OSM).
 * No requiere API key pero sí un User-Agent identificable.
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 */

export interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
}

/** Busca una dirección y devuelve hasta `limit` resultados. */
export async function searchAddress(
  query: string,
  limit = 5,
): Promise<GeoResult[]> {
  const q = query.trim();
  if (q.length < 4) return [];

  const params = new URLSearchParams({ q, limit: String(limit) });

  try {
    const res = await fetch(`/api/geocode?${params.toString()}`, {
      // El API route ya cachea; aquí reforzamos con el cache del browser
      cache: "force-cache",
    });
    if (!res.ok) return [];

    const data = (await res.json()) as GeoResult[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}