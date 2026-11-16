import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaDependencias } from "@/modules/catalogo/componentes/TablaCatalogosSimples";

export const instant = false;

export default async function DependenciasPage() {
  await exigirPermiso(PERMISOS.dependenciaVer);
  return (
    <>
      <PageHeader
        title="Dependencias"
        subtitle="Unidades organizacionales que ejecutan trámites y recaudan."
      />
      <TablaDependencias />
    </>
  );
}
