import { Box, Button, Paper, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { RUTAS } from "@/modules/seguridad/comun/constantes";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";

/**
 * Módulo: Seguridad / Autorización
 * Archivo: (dashboard)/denegado/page.tsx
 *
 * Pantalla 403 para usuarios autenticados sin permiso. No redirige al
 * login: la sesión es válida, solo falta autorización.
 */
export const instant = false;

export default async function DenegadoPage({
  searchParams,
}: {
  searchParams: Promise<{ permiso?: string }>;
}) {
  await exigirSesion();
  const { permiso } = await searchParams;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 4, md: 8 } }}>
      <Paper
        variant="outlined"
        sx={{ p: { xs: 3, md: 5 }, maxWidth: 560, textAlign: "center" }}
      >
        <LockOutlinedIcon sx={{ fontSize: 56, color: "warning.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
          Acceso denegado
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Tu usuario no tiene el permiso necesario para ver esta sección.
          {permiso ? ` Permiso requerido: ${permiso}.` : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Si necesitas acceso, solicita a un administrador que revise tus roles.
        </Typography>
        <Button
          component="a"
          href={RUTAS.inicio}
          variant="contained"
          sx={{ mt: 3 }}
        >
          Volver al inicio
        </Button>
      </Paper>
    </Box>
  );
}
