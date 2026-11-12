"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Chip, Stack } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { RouteLayer } from "./RouteLayer";
import { formatDistance, formatDuration, RouteResult } from "@/common/lib/osrm";

// Fix de íconos por defecto
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

/** Ajusta el tamaño del mapa tras la animación del Dialog. */
function InvalidateOnMount() {
  const map = useMap();
  useMemo(() => {
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

import { useEffect, useMemo } from "react";

interface Props {
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  height?: number;
  origenLabel?: string;
  destinoLabel?: string;
}

/**
 * Mapa de sólo lectura que muestra origen, destino y la ruta en auto.
 * No permite interacción de selección (eso es potestad de MapPicker).
 */
export default function RouteMapViewer({
  origenLat,
  origenLng,
  destinoLat,
  destinoLng,
  height = 320,
  origenLabel = "Origen",
  destinoLabel = "Destino",
}: Props) {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const center: [number, number] = [origenLat, origenLng];

  return (
    <Box sx={{ position: "relative" }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height, width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[origenLat, origenLng]} icon={origenIcon}>
          <Popup>{origenLabel}</Popup>
        </Marker>

        <Marker position={[destinoLat, destinoLng]} icon={destinoIcon}>
          <Popup>{destinoLabel}</Popup>
        </Marker>

        <RouteLayer
          origenLat={origenLat}
          origenLng={origenLng}
          destinoLat={destinoLat}
          destinoLng={destinoLng}
          onRouteChange={setRoute}
        />

        <InvalidateOnMount />
      </MapContainer>

      {route ? (
        <Stack
          direction="row"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
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