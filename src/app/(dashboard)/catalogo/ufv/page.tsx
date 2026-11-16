import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaUfv } from "@/modules/catalogo/componentes/TablaCatalogosRelacionados";

export const instant = false;

export default async function UfvPage() {
  await exigirPermiso(PERMISOS.ufvVer);
  return (
    <>
      <PageHeader
        title="UFV"
        subtitle="Valores diarios de la Unidad de Fomento a la Vivienda."
      />
      <TablaUfv />
    </>
  );
}
