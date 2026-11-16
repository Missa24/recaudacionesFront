import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaArancelesDetalle } from "@/modules/arancel/componentes/TablasArancel";

export const instant = false;

export default async function DetallesPage() {
  await exigirPermiso(PERMISOS.arancelDetalleVer);
  return (
    <>
      <PageHeader
        title="Detalles de arancel"
        subtitle="Conceptos específicos que componen un arancel para cada tipo de trámite."
      />
      <TablaArancelesDetalle />
    </>
  );
}
