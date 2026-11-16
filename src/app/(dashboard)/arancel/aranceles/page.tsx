import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaArancelesGenerales } from "@/modules/arancel/componentes/TablasArancel";

export const instant = false;

export default async function ArancelesPage() {
  await exigirPermiso(PERMISOS.arancelGeneralVer);
  return (
    <>
      <PageHeader
        title="Aranceles"
        subtitle="Aranceles generales por dependencia y cuenta bancaria de destino."
      />
      <TablaArancelesGenerales />
    </>
  );
}
