import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaModulos } from "@/modules/seguridad/modulos/componentes/TablaModulos";

/**
 * Módulo: Seguridad / Módulos
 * Archivo: modulos/page.tsx
 *
 * Página protegida por `MODULO_VER`.
 */
export const instant = false;

export default async function ModulosPage() {
  await exigirPermiso(PERMISOS.moduloVer);

  return (
    <>
      <PageHeader
        title="Módulos"
        subtitle="Catálogo de módulos funcionales y su ruta de navegación."
      />
      <TablaModulos />
    </>
  );
}
