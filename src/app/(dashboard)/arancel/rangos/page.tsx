import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaArancelesRango } from "@/modules/arancel/componentes/TablasArancel";

export const instant = false;

export default async function RangosPage() {
  await exigirPermiso(PERMISOS.arancelRangoVer);
  return (
    <>
      <PageHeader
        title="Rangos de tarifa"
        subtitle="Base fija, porcentaje y excedente para tarifas de monto variable."
      />
      <TablaArancelesRango />
    </>
  );
}
