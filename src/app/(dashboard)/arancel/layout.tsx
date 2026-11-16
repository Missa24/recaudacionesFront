import { redirect } from "next/navigation";
import { PERMISOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import { puedeAlguno } from "@/modules/seguridad/auth/contexto";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";
import {
  opcionesCuentasBancarias,
  opcionesDependencias,
  opcionesRequisitosCatalogo,
} from "@/modules/catalogo/servidor/servicio-catalogo";
import {
  opcionesArancelesDetalle,
  opcionesArancelesGenerales,
  opcionesTarifas,
  opcionesTiposTramite,
} from "@/modules/arancel/servidor/servicio-arancel";
import { ArancelOpcionesProvider } from "@/modules/arancel/componentes/ArancelOpciones";

/**
 * Módulo: Aranceles
 * Archivo: arancel/layout.tsx
 *
 * Puerta del área de aranceles. Precarga las opciones que usan las tablas
 * y formularios de tipos de trámite, aranceles, tarifas y rangos.
 */
export const instant = false;

const PERMISOS_AREA = [
  PERMISOS.tipoTramiteVer,
  PERMISOS.arancelGeneralVer,
  PERMISOS.arancelDetalleVer,
  PERMISOS.tarifaVer,
  PERMISOS.arancelRangoVer,
  PERMISOS.arancelRequisitoVer,
];

export default async function ArancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, contexto } = await exigirSesion();
  if (!puedeAlguno(contexto, PERMISOS_AREA)) redirect(RUTAS.denegado);

  const [
    dependencias,
    cuentas,
    tiposTramite,
    arancelesGenerales,
    arancelesDetalle,
    tarifas,
    requisitos,
  ] = await Promise.all([
    opcionesDependencias(token),
    opcionesCuentasBancarias(token),
    opcionesTiposTramite(token),
    opcionesArancelesGenerales(token),
    opcionesArancelesDetalle(token),
    opcionesTarifas(token),
    opcionesRequisitosCatalogo(token),
  ]);

  return (
    <ArancelOpcionesProvider
      dependencias={dependencias}
      cuentas={cuentas}
      tiposTramite={tiposTramite}
      arancelesGenerales={arancelesGenerales}
      arancelesDetalle={arancelesDetalle}
      tarifas={tarifas}
      requisitos={requisitos}
    >
      {children}
    </ArancelOpcionesProvider>
  );
}
