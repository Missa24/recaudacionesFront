import { PageHeader } from "@/common/components/PageHeader";
import { PERMISOS } from "@/modules/seguridad/comun/constantes";
import { exigirPermiso } from "@/modules/seguridad/auth/servidor/guardias";
import { TablaUsuarios } from "@/modules/seguridad/usuarios/componentes/TablaUsuarios";

/**
 * Módulo: Seguridad / Usuarios
 * Archivo: usuarios/page.tsx
 *
 * Página protegida por `USUARIO_VER` en el servidor. La tabla y sus
 * acciones se renderizan en cliente, pero cada Server Action revalida el
 * permiso antes de escribir.
 */
export const instant = false;

export default async function UsuariosPage() {
  await exigirPermiso(PERMISOS.usuarioVer);

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Personas habilitadas en el sistema, sus datos y roles."
      />
      <TablaUsuarios />
    </>
  );
}
