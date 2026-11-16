import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaArancelesRequisito } from "@/modules/arancel/componentes/TablasArancel";

export const instant = false;

export default async function RequisitosTramitePage() {
  await exigirPermiso(PERMISOS.arancelRequisitoVer);
  return (
    <>
      <PageHeader
        title="Requisitos del trámite"
        subtitle="Documentos exigidos por tipo de trámite, su orden y obligatoriedad."
      />
      <TablaArancelesRequisito />
    </>
  );
}
