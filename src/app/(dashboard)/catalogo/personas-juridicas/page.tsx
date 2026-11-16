import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaPersonasJuridicas } from "@/modules/catalogo/componentes/TablaCatalogosRelacionados";

export const instant = false;

export default async function PersonasJuridicasPage() {
  await exigirPermiso(PERMISOS.personaJuridicaVer);
  return (
    <>
      <PageHeader
        title="Personas jurídicas"
        subtitle="Empresas y entidades con NIT que realizan trámites."
      />
      <TablaPersonasJuridicas />
    </>
  );
}
