import { Alert } from "@mui/material";
import { requireSession, requireUserProfile } from "../session";
import { getSecurityNavigation } from "@/services/seguridad.service";
import { ApplicationShell } from "./application-shell";

export default async function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await requireSession();
  const profile = await requireUserProfile();
  let navigation;
  try {
    navigation = await getSecurityNavigation(token);
  } catch {
    return (
      <Alert severity="error">
        No se pudieron consultar los permisos en Seguridad.
      </Alert>
    );
  }
  return (
    <ApplicationShell systems={navigation} profile={profile}>
      {children}
    </ApplicationShell>
  );
}
