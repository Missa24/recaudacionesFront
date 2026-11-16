import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaRequisitos } from "@/modules/catalogo/componentes/TablaCatalogosSimples";

export const instant = false;

export default async function RequisitosPage() {
  await exigirPermiso(PERMISOS.requisitoVer);
  return (
    <>
      <PageHeader
        title="Requisitos"
        subtitle="Documentos exigidos que luego se asocian a cada tipo de trámite."
      />
      <TablaRequisitos />
    </>
  );
}
