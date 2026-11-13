import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaPermisos } from "@/modules/seguridad/permisos/componentes/TablaPermisos";

/**
 * Módulo: Seguridad / Permisos
 * Archivo: permisos/page.tsx
 *
 * Página protegida por `PERMISO_VER`.
 */
export const instant = false;

export default async function PermisosPage() {
  await exigirPermiso(PERMISOS.permisoVer);

  return (
    <>
      <PageHeader
        title="Permisos"
        subtitle="Acciones autorizables que se asignan a los roles por módulo."
      />
      <TablaPermisos />
    </>
  );
}
