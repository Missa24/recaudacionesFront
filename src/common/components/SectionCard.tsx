"use client";

import { ReactNode } from "react";
import { Box, Card, CardProps, Stack, Typography } from "@mui/material";
import { elevation, surfaces } from "@/theme/tokens";

interface Props extends Omit<CardProps, "title"> {
  titulo?: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
}

/**
 * Bloque de formulario o de contenido.
 *
 * Reemplaza las `Card variant="outlined"` repetidas en cada formulario, para que
 * el espaciado y el encabezado sean iguales en todo el módulo.
 */
export function SectionCard({
  titulo,
  descripcion,
  acciones,
  children,
  sx,
  ...resto
}: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: surfaces.border,
        boxShadow: elevation.card,
        p: { xs: 2, md: 2.5 },
        ...sx,
      }}
      {...resto}
    >
      {(titulo || acciones || descripcion) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            {titulo ? (
              <Typography variant="subtitle1" color="text.primary">
                {titulo}
              </Typography>
            ) : null}
            {descripcion ? (
              <Typography variant="body2" color="text.secondary">
                {descripcion}
              </Typography>
            ) : null}
          </Box>
          {acciones ? <Box>{acciones}</Box> : null}
        </Stack>
      )}
      {children}
    </Card>
  );
}
