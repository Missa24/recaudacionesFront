import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LinkCardActionArea from "@/common/components/LinkCardActionArea";
import { PageHeader } from "@/common/components/PageHeader";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";
import { nombreCompleto } from "@/modules/seguridad/auth/contexto";

/**
 * Módulo: Seguridad / Inicio
 * Archivo: (dashboard)/page.tsx
 *
 * Panel principal. Muestra los módulos que el backend autorizó para el
 * usuario; no hay navegación hardcodeada, sale de `seguridad.modulo`.
 */
export const instant = false;

export default async function Home() {
  const { contexto } = await exigirSesion();

  return (
    <>
      <PageHeader
        title={`Hola, ${nombreCompleto(contexto.usuario)}`}
        subtitle="Estos son los módulos habilitados para tu perfil."
      />

      {contexto.modulos.length === 0 ? (
        <Alert severity="info">
          Tu usuario no tiene módulos asignados. Solicita a un administrador que
          te asigne un rol con permisos.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {contexto.modulos.map((modulo) => (
            <Grid key={modulo.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <LinkCardActionArea href={modulo.ruta} padding={1}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {modulo.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, minHeight: 40 }}
                    >
                      {modulo.descripcion ?? modulo.ruta}
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      Abrir módulo <ArrowForwardRoundedIcon fontSize="small" />
                    </Box>
                  </CardContent>
                </LinkCardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
