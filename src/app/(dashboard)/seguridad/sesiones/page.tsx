import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaSesiones } from "@/modules/seguridad/sesiones/componentes/TablaSesiones";

/**
 * Módulo: Seguridad / Sesiones
 * Archivo: sesiones/page.tsx
 *
 * Historial de accesos del usuario autenticado, protegido por `SESION_VER`.
 */
export const instant = false;

export default async function SesionesPage() {
  await exigirPermiso(PERMISOS.sesionVer);

  return (
    <>
      <PageHeader
        title="Sesiones"
        subtitle="Accesos registrados para tu usuario, con IP y navegador."
      />
      <TablaSesiones />
    </>
  );
}
