"use client";

import Link from "next/link";
import { CardActionArea } from "@mui/material";

export default function LinkCardActionArea({
  href,
  children,
  padding = 0,
}: {
  href: string;
  children: React.ReactNode;
  padding?: number;
}) {
  return (
    <CardActionArea
      component={Link}
      href={href}
      sx={{ height: "100%", p: padding }}
    >
      {children}
    </CardActionArea>
  );
}
