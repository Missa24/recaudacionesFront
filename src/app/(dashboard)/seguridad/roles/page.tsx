import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaRoles } from "@/modules/seguridad/roles/componentes/TablaRoles";

/**
 * Módulo: Seguridad / Roles
 * Archivo: roles/page.tsx
 *
 * Página protegida por `ROL_VER`.
 */
export const instant = false;

export default async function RolesPage() {
  await exigirPermiso(PERMISOS.rolVer);

  return (
    <>
      <PageHeader
        title="Roles"
        subtitle="Agrupa permisos por función y asígnalos a los usuarios."
      />
      <TablaRoles />
    </>
  );
}
