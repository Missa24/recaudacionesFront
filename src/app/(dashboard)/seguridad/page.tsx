import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import LinkCardActionArea from "@/common/components/LinkCardActionArea";
import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import { puedePermiso } from "@/modules/seguridad/auth/contexto";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";

/**
 * Módulo: Seguridad / Inicio
 * Archivo: (dashboard)/seguridad/page.tsx
 *
 * Resumen del módulo. Cada tarjeta se muestra solo si el usuario tiene el
 * permiso de consulta correspondiente.
 */
export const instant = false;

const SECCIONES = [
  {
    ruta: RUTAS.usuarios,
    titulo: "Usuarios",
    descripcion: "Datos de las personas habilitadas y sus roles.",
    permiso: PERMISOS.usuarioVer,
    icono: <PeopleAltOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.roles,
    titulo: "Roles",
    descripcion: "Agrupa permisos por función y asígnalos a usuarios.",
    permiso: PERMISOS.rolVer,
    icono: <AdminPanelSettingsOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.modulos,
    titulo: "Módulos",
    descripcion: "Catálogo de módulos y sus rutas de navegación.",
    permiso: PERMISOS.moduloVer,
    icono: <ViewModuleOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.permisos,
    titulo: "Permisos",
    descripcion: "Acciones autorizables que se combinan con módulos.",
    permiso: PERMISOS.permisoVer,
    icono: <VpnKeyOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.sesiones,
    titulo: "Sesiones",
    descripcion: "Historial de accesos del usuario autenticado.",
    permiso: PERMISOS.sesionVer,
    icono: <DevicesOutlinedIcon fontSize="large" />,
  },
];

export default async function SeguridadPage() {
  const { contexto } = await exigirSesion();
  const visibles = SECCIONES.filter((seccion) =>
    puedePermiso(contexto, seccion.permiso),
  );

  return (
    <>
      <PageHeader
        title="Seguridad"
        subtitle="Administra usuarios, roles, módulos y permisos del sistema."
      />

      <Grid container spacing={2}>
        {visibles.map((seccion) => (
          <Grid key={seccion.ruta} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <LinkCardActionArea href={seccion.ruta}>
                <CardContent>
                  <Box sx={{ color: "primary.main", mb: 1 }}>{seccion.icono}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {seccion.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {seccion.descripcion}
                  </Typography>
                </CardContent>
              </LinkCardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {visibles.length === 0 ? (
        <Box sx={{ color: "text.secondary", display: "flex", gap: 1, alignItems: "center" }}>
          <ShieldOutlinedIcon /> No tienes permisos para administrar la seguridad.
        </Box>
      ) : null}
    </>
  );
}
