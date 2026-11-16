import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaCalendario } from "@/modules/catalogo/componentes/TablaCatalogosRelacionados";

export const instant = false;

export default async function CalendarioPage() {
  await exigirPermiso(PERMISOS.calendarioVer);
  return (
    <>
      <PageHeader
        title="Calendario"
        subtitle="Días hábiles, feriados y fechas no laborables para el cómputo de plazos."
      />
      <TablaCalendario />
    </>
  );
}
