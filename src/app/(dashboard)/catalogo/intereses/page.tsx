import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaIntereses } from "@/modules/catalogo/componentes/TablaCatalogosSimples";

export const instant = false;

export default async function InteresesPage() {
  await exigirPermiso(PERMISOS.interesVer);
  return (
    <>
      <PageHeader
        title="Intereses"
        subtitle="Valores de interés publicados por fecha para el cálculo de moras."
      />
      <TablaIntereses />
    </>
  );
}
