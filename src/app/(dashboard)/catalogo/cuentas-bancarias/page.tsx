import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaCuentasBancarias } from "@/modules/catalogo/componentes/TablaCatalogosRelacionados";

export const instant = false;

export default async function CuentasPage() {
  await exigirPermiso(PERMISOS.cuentaBancariaVer);
  return (
    <>
      <PageHeader
        title="Cuentas bancarias"
        subtitle="Cuentas recaudadoras asociadas a un banco y, opcionalmente, a una dependencia."
      />
      <TablaCuentasBancarias />
    </>
  );
}
