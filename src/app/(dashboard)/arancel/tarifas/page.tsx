import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaTarifas } from "@/modules/arancel/componentes/TablasArancel";

export const instant = false;

export default async function TarifasPage() {
  await exigirPermiso(PERMISOS.tarifaVer);
  return (
    <>
      <PageHeader
        title="Tarifas"
        subtitle="Montos vigentes por detalle de arancel, con su referencia de aprobación."
      />
      <TablaTarifas />
    </>
  );
}
