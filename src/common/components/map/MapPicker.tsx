"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Chip, Stack, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { RouteLayer } from "./RouteLayer";
import { formatDistance, formatDuration, RouteResult } from "@/common/lib/osrm";

// Fix íconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const origenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinoIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  origenLat: number;
  origenLng: number;
  destinoLat: number | null;
  destinoLng: number | null;
  onChange: (lat: number, lng: number) => void;
  origenLabel?: string;
  destinoLabel?: string;
  readOnly?: boolean;
  /** Callback opcional para notificar al padre el resultado de la ruta. */
  onRouteChange?: (route: RouteResult | null) => void;
}

function ClickHandler({
  onChange,
  readOnly,
}: {
  onChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Selector de ubicación en mapa con dibujo de ruta.
 * - Marcador azul (fijo) para el origen.
 * - Marcador rojo (arrastrable) para el destino.
 * - Clic en el mapa reubica el destino.
 * - Se dibuja la ruta en auto y se muestra distancia + duración.
 */
export default function MapPicker({
  origenLat,
  origenLng,
  destinoLat,
  destinoLng,
  onChange,
  origenLabel = "Origen",
  destinoLabel = "Destino",
  readOnly = false,
  onRouteChange,
}: Props) {
  const [route, setRoute] = useState<RouteResult | null>(null);

  // Guard: sin origen válido no se puede montar el mapa.
  if (typeof origenLat !== "number" || typeof origenLng !== "number") {
    return (
      <Box
        sx={{
          height: 400,
          display: "grid",
          placeItems: "center",
          bgcolor: "grey.100",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Coordenadas de origen no disponibles
        </Typography>
      </Box>
    );
  }

  const center: [number, number] = [origenLat, origenLng];
  const hasDestino =
    typeof destinoLat === "number" && typeof destinoLng === "number";

  return (
    <Box sx={{ position: "relative" }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: 400, width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[origenLat, origenLng]} icon={origenIcon}>
          <Popup>{origenLabel}</Popup>
        </Marker>

        {hasDestino ? (
          <Marker
            position={[destinoLat, destinoLng]}
            icon={destinoIcon}
            draggable={!readOnly}
            eventHandlers={
              readOnly
                ? undefined
                : {
                    dragend: (e) => {
                      const { lat, lng } = (e.target as L.Marker).getLatLng();
                      onChange(lat, lng);
                    },
                  }
            }
          >
            <Popup>{destinoLabel}</Popup>
          </Marker>
        ) : null}

        {/* Ruta en auto entre origen y destino */}
        <RouteLayer
          origenLat={origenLat}
          origenLng={origenLng}
          destinoLat={destinoLat}
          destinoLng={destinoLng}
          onRouteChange={(r) => {
            setRoute(r);
            onRouteChange?.(r);
          }}
        />

        <ClickHandler onChange={onChange} readOnly={readOnly} />
      </MapContainer>

      {/* Badge flotante con la info de la ruta */}
      {route ? (
        <Stack
          direction="row"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000, // por encima de los controles de Leaflet
            gap: 1,
          }}
        >
          <Chip
            size="small"
            icon={<StraightenIcon fontSize="small" />}
            label={formatDistance(route.distanceMeters)}
            sx={{ bgcolor: "background.paper", boxShadow: 2 }}
          />
          <Chip
            size="small"
            icon={<AccessTimeIcon fontSize="small" />}
            label={formatDuration(route.durationSeconds)}
            sx={{ bgcolor: "background.paper", boxShadow: 2 }}
          />
          <Chip
            size="small"
            icon={<DirectionsCarIcon fontSize="small" />}
            label="Auto"
            sx={{ bgcolor: "background.paper", boxShadow: 2 }}
          />
        </Stack>
      ) : null}
    </Box>
  );
}