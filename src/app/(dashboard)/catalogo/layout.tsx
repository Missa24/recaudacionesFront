import { redirect } from "next/navigation";
import { PERMISOS, RUTAS } from "@/modules/seguridad/comun/constantes";
import { puedeAlguno } from "@/modules/seguridad/auth/contexto";
import { exigirSesion } from "@/modules/seguridad/auth/servidor/sesion";
import { CatalogoOpcionesProvider } from "@/modules/catalogo/componentes/CatalogoOpciones";
import {
  opcionesBancos,
  opcionesDependencias,
} from "@/modules/catalogo/servidor/servicio-catalogo";

/**
 * Módulo: Catálogos
 * Archivo: catalogo/layout.tsx
 *
 * Puerta del área de catálogos. Valida que el usuario tenga al menos un
 * permiso de consulta y precarga las opciones de bancos y dependencias.
 */
export const instant = false;

const PERMISOS_AREA = [
  PERMISOS.bancoVer,
  PERMISOS.cuentaBancariaVer,
  PERMISOS.dependenciaVer,
  PERMISOS.interesVer,
  PERMISOS.calendarioVer,
  PERMISOS.personaNaturalVer,
  PERMISOS.personaJuridicaVer,
  PERMISOS.requisitoVer,
  PERMISOS.ufvVer,
];

export default async function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, contexto } = await exigirSesion();
  if (!puedeAlguno(contexto, PERMISOS_AREA)) redirect(RUTAS.denegado);

  const [bancos, dependencias] = await Promise.all([
    opcionesBancos(token),
    opcionesDependencias(token),
  ]);

  return (
    <CatalogoOpcionesProvider bancos={bancos} dependencias={dependencias}>
      {children}
    </CatalogoOpcionesProvider>
  );
}
