import {
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import { PageHeader } from "@/common/components/PageHeader";
import LinkCardActionArea from "@/common/components/LinkCardActionArea";
import { PERMISOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import { puedePermiso } from "@/modules/seguridad/auth/contexto";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";

/**
 * Módulo: Aranceles
 * Archivo: arancel/page.tsx
 *
 * Portada del área. Muestra solo los recursos habilitados.
 */
export const instant = false;

const SECCIONES = [
  {
    ruta: RUTAS.arancelTiposTramite,
    titulo: "Tipos de trámite",
    descripcion: "Catálogo de trámites, su tipo VUT y dependencia ejecutora.",
    permiso: PERMISOS.tipoTramiteVer,
    icono: <ViewListOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.arancelGenerales,
    titulo: "Aranceles",
    descripcion: "Aranceles generales por dependencia y cuenta destino.",
    permiso: PERMISOS.arancelGeneralVer,
    icono: <ReceiptLongOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.arancelDetalles,
    titulo: "Detalles de arancel",
    descripcion: "Conceptos específicos asociados a un arancel y trámite.",
    permiso: PERMISOS.arancelDetalleVer,
    icono: <AccountTreeOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.arancelTarifas,
    titulo: "Tarifas",
    descripcion: "Montos vigentes por detalle de arancel.",
    permiso: PERMISOS.tarifaVer,
    icono: <PaidOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.arancelRangos,
    titulo: "Rangos",
    descripcion: "Base fija, porcentaje y excedente para montos variables.",
    permiso: PERMISOS.arancelRangoVer,
    icono: <TuneOutlinedIcon fontSize="large" />,
  },
  {
    ruta: RUTAS.arancelRequisitos,
    titulo: "Requisitos del trámite",
    descripcion: "Documentos exigidos por cada tipo de trámite.",
    permiso: PERMISOS.arancelRequisitoVer,
    icono: <ChecklistOutlinedIcon fontSize="large" />,
  },
];

export default async function ArancelPage() {
  const { contexto } = await exigirSesion();
  const visibles = SECCIONES.filter((seccion) =>
    puedePermiso(contexto, seccion.permiso),
  );

  return (
    <>
      <PageHeader
        title="Aranceles"
        subtitle="Tipos de trámite, aranceles, tarifas y requisitos del sistema."
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
