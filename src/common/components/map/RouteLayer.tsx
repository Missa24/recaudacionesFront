"use client";

import { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import {
  formatDistance,
  formatDuration,
  getDrivingRoute,
  RouteResult,
} from "@/common/lib/osrm";

interface Props {
  origenLat: number;
  origenLng: number;
  destinoLat: number | null;
  destinoLng: number | null;
  /** Callback opcional para exponer el resultado al padre. */
  onRouteChange?: (route: RouteResult | null) => void;
}

/**
 * Dibuja la ruta en auto entre el origen y el destino sobre el mapa,
 * y ajusta el encuadre para que ambos puntos queden visibles.
 *
 * - Se recalcula cuando cambian las coordenadas de destino.
 * - Si el cálculo falla (fuera de ruta, error de red), no rompe: simplemente
 *   no dibuja nada.
 */
export function RouteLayer({
  origenLat,
  origenLng,
  destinoLat,
  destinoLng,
  onRouteChange,
}: Props) {
  const map = useMap();
  const [route, setRoute] = useState<RouteResult | null>(null);

  useEffect(() => {
    if (
      typeof destinoLat !== "number" ||
      typeof destinoLng !== "number"
    ) {
      setRoute(null);
      onRouteChange?.(null);
      return;
    }

    let alive = true;
    (async () => {
      const r = await getDrivingRoute(
        origenLat,
        origenLng,
        destinoLat,
        destinoLng,
      );
      if (!alive) return;
      setRoute(r);
      onRouteChange?.(r);

      // Encuadra la vista para mostrar toda la ruta + un poco de margen.
      if (r && r.coordinates.length > 1) {
        const bounds = L.latLngBounds(
          r.coordinates.map(([lat, lng]) => L.latLng(lat, lng)),
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origenLat, origenLng, destinoLat, destinoLng]);

  if (!route || route.coordinates.length < 2) return null;

  return (
    <Polyline
      positions={route.coordinates}
      pathOptions={{
        color: "#0B4F9E",
        weight: 5,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}