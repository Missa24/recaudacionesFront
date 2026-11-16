import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaBancos } from "@/modules/catalogo/componentes/TablaCatalogosSimples";

export const instant = false;

export default async function BancosPage() {
  await exigirPermiso(PERMISOS.bancoVer);
  return (
    <>
      <PageHeader title="Bancos" subtitle="Entidades financieras registradas en el sistema." />
      <TablaBancos />
    </>
  );
}
