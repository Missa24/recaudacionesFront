import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaPersonasNaturales } from "@/modules/catalogo/componentes/TablaCatalogosRelacionados";

export const instant = false;

export default async function PersonasNaturalesPage() {
  await exigirPermiso(PERMISOS.personaNaturalVer);
  return (
    <>
      <PageHeader
        title="Personas naturales"
        subtitle="Registro de contribuyentes y ciudadanos que realizan trámites."
      />
      <TablaPersonasNaturales />
    </>
  );
}
