"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@mui/material";

/** Carga el mapa sólo en el cliente (evita errores de SSR). */
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />,
});

export default MapPicker;