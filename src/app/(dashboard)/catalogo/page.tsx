import {
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { PageHeader } from "@/common/components/PageHeader";
import LinkCardActionArea from "@/common/components/LinkCardActionArea";
import { PERMISOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import { puedePermiso } from "@/modules/seguridad/auth/contexto";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";

/**
 * Módulo: Catálogos
 * Archivo: catalogo/page.tsx
 *
 * Portada del área. Muestra solo los catálogos habilitados para el usuario.
 */
export const instant = false;

const SECCIONES = [
  {
    ruta: RUTAS.catalogoBancos,
    titulo: "Bancos",
    descripcion: "Entidades financieras y su código BC.",
    permiso: PERMISOS.bancoVer,
    icono: <AccountBalanceOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoCuentas,
    titulo: "Cuentas bancarias",
    descripcion: "Cuentas recaudadoras asociadas a bancos y dependencias.",
    permiso: PERMISOS.cuentaBancariaVer,
    icono: <SavingsOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoDependencias,
    titulo: "Dependencias",
    descripcion: "Unidades organizacionales del gobierno departamental.",
    permiso: PERMISOS.dependenciaVer,
    icono: <DomainOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoIntereses,
    titulo: "Intereses",
    descripcion: "Valores de interés publicados por fecha.",
    permiso: PERMISOS.interesVer,
    icono: <PercentOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoCalendario,
    titulo: "Calendario",
    descripcion: "Días hábiles, feriados y fechas no laborables.",
    permiso: PERMISOS.calendarioVer,
    icono: <CalendarMonthOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoPersonasNaturales,
    titulo: "Personas naturales",
    descripcion: "Registro de contribuyentes y ciudadanos.",
    permiso: PERMISOS.personaNaturalVer,
    icono: <PersonOutlineOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoPersonasJuridicas,
    titulo: "Personas jurídicas",
    descripcion: "Empresas y entidades con NIT.",
    permiso: PERMISOS.personaJuridicaVer,
    icono: <GroupsOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoRequisitos,
    titulo: "Requisitos",
    descripcion: "Documentos exigidos en los trámites.",
    permiso: PERMISOS.requisitoVer,
    icono: <DescriptionOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.catalogoUfv,
    titulo: "UFV",
    descripcion: "Valores de la Unidad de Fomento a la Vivienda.",
    permiso: PERMISOS.ufvVer,
    icono: <QueryStatsOutlinedIcon fontSize="large" />,
  },
];

export default async function CatalogoPage() {
  const { contexto } = await exigirSesion();
  const visibles = SECCIONES.filter((seccion) =>
    puedePermiso(contexto, seccion.permiso),
  );

  return (
    <>
      <PageHeader
        title="Catálogos"
        subtitle="Datos maestros que alimentan los trámites, aranceles y recaudaciones."
      />

      <Grid container spacing={2}>
        {visibles.map((seccion) => (
          <Grid key={seccion.ruta} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <LinkCardActionArea href={seccion.ruta}>
                <CardContent>
                  <Typography sx={{ color: "primary.main", mb: 1 }}>
                    {seccion.icono}
                  </Typography>
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
    </>
  );
}
