/**
 * Cliente para el servicio de routing OSRM (Open Source Routing Machine).
 * Servidor demo público, gratuito, sin API key.
 *
 * Docs: http://project-osrm.org/docs/v5.24.0/api/#route-service
 *
 * ⚠️ El servidor demo es para desarrollo/pruebas. Para producción con
 *    tráfico alto, considera self-hosting:
 *    https://github.com/Project-OSRM/osrm-backend
 */

const BASE = "https://router.project-osrm.org";

export interface RouteResult {
  /** Coordenadas [lat, lng] que dibuja la ruta. */
  coordinates: [number, number][];
  /** Geometría GeoJSON [lng, lat] para persistir en el backend. */
  geojson: {
    type: "LineString";
    coordinates: [number, number][];
  };
  /** Distancia total en metros. */
  distanceMeters: number;
  /** Duración estimada en segundos. */
  durationSeconds: number;
}

/**
 * Calcula la ruta en auto entre dos puntos.
 * Retorna `null` si no se puede calcular (fuera de ruta, error de red).
 */
export async function getDrivingRoute(
  origenLat: number,
  origenLng: number,
  destinoLat: number,
  destinoLng: number,
): Promise<RouteResult | null> {
  // OSRM espera lng,lat (ojo con el orden)
  const coords = `${origenLng},${origenLat};${destinoLng},${destinoLat}`;
  const url = `${BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const route = data?.routes?.[0];
    if (!route) return null;

    // OSRM devuelve [lng, lat], mientras Leaflet necesita [lat, lng].
    const geojsonCoordinates = route.geometry.coordinates as [number, number][];
    const coordinates: [number, number][] = geojsonCoordinates
      .map((c: [number, number]) => [c[1], c[0]] as [number, number]);

    return {
      coordinates,
      geojson: { type: "LineString", coordinates: geojsonCoordinates },
      distanceMeters: route.distance ?? 0,
      durationSeconds: route.duration ?? 0,
    };
  } catch {
    return null;
  }
}

/** Formatea metros a "12,3 km" o "850 m". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Formatea segundos a "1 h 25 min" o "45 min". */
export function formatDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}