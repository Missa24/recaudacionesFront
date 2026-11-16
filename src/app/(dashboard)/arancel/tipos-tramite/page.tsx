import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaTiposTramite } from "@/modules/arancel/componentes/TablasArancel";

export const instant = false;

export default async function TiposTramitePage() {
  await exigirPermiso(PERMISOS.tipoTramiteVer);
  return (
    <>
      <PageHeader
        title="Tipos de trámite"
        subtitle="Catálogo de trámites con su tipo VUT, dependencia ejecutora y reglas de flujo."
      />
      <TablaTiposTramite />
    </>
  );
}
