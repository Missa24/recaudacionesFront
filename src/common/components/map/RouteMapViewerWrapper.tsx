"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@mui/material";

const RouteMapViewer = dynamic(() => import("./RouteMapViewer"), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
  ),
});

export default RouteMapViewer;