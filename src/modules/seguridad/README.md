# Módulo de Seguridad — Fase 1

Módulo de autenticación y autorización del frontend de Recaudaciones
(Next.js 16, App Router, React 19, MUI). Consume el backend NestJS
existente y respeta el esquema `seguridad` del diagrama entidad-relación.

## 1. Qué resuelve

- **Autenticación** contra `POST /api/auth/login` (LDAP vía NestJS) con JWT
  guardado en cookie `httpOnly`. El navegador nunca ve el token.
- **Autorización efectiva** calculada desde la base de datos:
  `usuario → usuario_rol → rol → rol_modulo_permiso → modulo / permiso`.
- **Sesiones**: registra `seguridad.sesion` al iniciar, guarda su `id` en la
  cookie firmada y la cierra al salir. El backend actualiza
  `usuario.ultimo_acceso`.
- **Protección de rutas** en tres capas: proxy, layout y página/Server Action.
- **Administración base**: usuarios, roles, módulos, permisos, matriz de
  permisos por rol e historial de sesiones.
- **Expiración**: aviso a los 2 minutos, cierre automático al vencer el JWT y
  recálculo de permisos cada 5 minutos.

## 2. Estructura

```
src/
├── proxy.ts                              # comprobación optimista de cookies
├── lib/http/
│   ├── cliente-seguridad.ts              # fetch tipado al backend (server-only)
│   └── conexion.ts                        # IP y user-agent para la sesión
├── modules/seguridad/
│   ├── comun/
│   │   ├── constantes.ts                 # cookies, rutas, módulos y permisos
│   │   ├── tipos.ts                      # Pagina, ResultadoAccion, ResultadoListado
│   │   ├── utilidades.ts                 # fechas y textos
│   │   ├── componentes/                  # diálogo de formulario, chip de estado
│   │   └── hooks/useListadoSeguridad.ts  # búsqueda + paginación + orden
│   ├── auth/
│   │   ├── tipos.ts                      # ContextoSesion, SesionServidor
│   │   ├── contexto.ts                   # helpers puros (puedePermiso, …)
│   │   ├── acciones.ts                   # login y logout (Server Actions)
│   │   ├── componentes/                  # SessionProvider, guard, PermissionGate
│   │   └── servidor/
│   │       ├── sesion.ts                 # cookies firmadas con jose
│   │       ├── servicio-autenticacion.ts # /auth, /sesion
│   │       ├── servicio-autorizacion.ts  # resolución de permisos
│   │       ├── guardias.ts               # exigirPermiso / sesionParaAccion
│   │       ├── accion-protegida.ts       # envoltorio de Server Actions
│   │       ├── refrescar-sesion.ts       # recálculo periódico
│   │       └── errores.ts                # mensajes seguros
│   ├── usuarios/                         # tipos, servicio, acciones, tabla, diálogos
│   ├── roles/                            # CRUD + editor de matriz de permisos
│   ├── modulos/                          # catálogo de módulos
│   ├── permisos/                         # catálogo de permisos
│   └── sesiones/                         # historial propio y cierre
└── app/
    ├── login/                            # pantalla existente, ahora server + form
    ├── api/auth/refresh/route.ts         # recálculo de contexto
    └── (dashboard)/
        ├── layout.tsx                    # sesión + shell
        ├── page.tsx                      # módulos autorizados
        ├── denegado/page.tsx             # 403 para autenticados
        └── seguridad/                    # usuarios, roles, módulos, permisos, sesiones
```

Cada dominio repite la misma forma: `tipos.ts`, `servidor/servicio-*.ts`
(HTTP), `acciones.ts` (Server Actions) y `componentes/` (UI). Así un módulo
futuro copia la estructura sin arrastrar dependencias de otro.

## 3. Flujo de login

1. `login-form.tsx` llama a `iniciarSesionAction(username, password, next)`.
2. La acción autentica en `POST /auth/login` y recibe `access_token` y
   `expires_at`.
3. `resolverAutorizacion` consulta usuario, roles y permisos por rol.
4. Se registra `POST /sesion` con IP y user-agent (best-effort).
5. Se firma `ContextoSesion` con `jose` usando el JWT como clave HMAC y se
   escriben dos cookies `httpOnly`:
   - `recaudacion_session`: JWT del backend.
   - `recaudacion_session_contexto`: contexto firmado (usuario, roles,
     códigos de permiso, módulos, `sesion_id`, expiración).
6. El formulario redirige al destino validado (solo rutas internas).

El contexto queda atado al token: si el token cambia o expira, la firma del
contexto deja de verificar. No se necesita un secreto adicional.

## 4. Modelo de autorización

```sql
usuario ──< usuario_rol >── rol ──< rol_modulo_permiso >── modulo
                                              └──────────> permiso
```

- Solo cuentan asignaciones `estado = 'ACTIVO'` y no eliminadas.
- Un permiso efectivo es la **unión** de los permisos de todos los roles.
- Un módulo aparece en el menú si el usuario tiene al menos un permiso en él.
- Un superusuario (`ADMIN`, `ADMINISTRADOR`, `SUPER_ADMIN` por defecto) recibe
  `permisos: ["*"]` y todos los módulos activos. Es una válvula de arranque
  configurable con `SECURITY_SUPER_ROLE_CODES`.

Los códigos usados por la fase 1 están en `comun/constantes.ts`:
`USUARIO_VER`, `USUARIO_CREAR`, `ROL_ASIGNAR_PERMISO`, `SESION_CERRAR`, etc.
Deben existir en `seguridad.permiso`; el script `docs/seguridad/seed-fase1.sql`
los crea junto con los módulos y los asigna al rol administrador.

## 5. Protección de rutas

| Capa | Archivo | Qué hace |
| --- | --- | --- |
| Proxy | `src/proxy.ts` | Si faltan cookies, redirige a `/login?next=…`. Comprobación optimista, sin consultar permisos. |
| Layout | `(dashboard)/layout.tsx` | Verifica la firma y expiración; monta `SessionProvider` y el shell. |
| Layout de área | `seguridad/layout.tsx` | Exige al menos un módulo de seguridad. |
| Página | `seguridad/*/page.tsx` | `exigirPermiso(PERMISOS.…)` antes de renderizar. Si falta, redirige a `/denegado`. |
| Server Action | `acciones.ts` | `sesionParaAccion(permiso)` antes de escribir. Nunca confía en la UI. |
| UI | `PermissionGate` / `useSession().puede()` | Oculta botones; no es una defensa. |

Ocultar un botón no autoriza nada: la acción vuelve a comprobar el permiso.

## 6. Cómo proteger un módulo nuevo

1. Crea el módulo en base de datos (`seguridad.modulo`) con su `ruta`.
2. Crea sus permisos (`seguridad.permiso`) y asígnalos a un rol con
   `rol_modulo_permiso`.
3. En la página nueva:

```tsx
export const instant = false;

export default async function MiModuloPage() {
  await exigirPermiso("MI_MODULO_VER");
  return <TablaMiModulo />;
}
```

4. En cada Server Action de escritura, usa el envoltorio existente:

```ts
return ejecutarAccion(
  "MI_MODULO_CREAR",
  async ({ token }) => {
    const respuesta = await crearMiRecurso(token, datos);
    return respuesta.message;
  },
  ["/mi-modulo"],
);
```

5. En componentes cliente, `const { puede } = useSession();` y
   `<PermissionGate permiso="MI_MODULO_CREAR">…</PermissionGate>`.

## 7. Contrato con el backend

Ver [`docs/seguridad/CONTRATO-BACKEND.md`](../../../docs/seguridad/CONTRATO-BACKEND.md)
y [`docs/seguridad/CAMBIOS-BACKEND.md`](../../../docs/seguridad/CAMBIOS-BACKEND.md).

Resumen: se usan los endpoints existentes de `auth`, `usuarios`,
`usuario-rol`, `rol-modulo-permiso`, `rol`, `modulo`, `permiso` y `sesion`.
Se requieren **cuatro ajustes mínimos** en el backend para que la sesión y
`ultimo_acceso` sean reales (no simulados):

1. `POST /sesion` debe usar el usuario del JWT (no un UUID fijo) y devolver
   el `id` creado.
2. `PATCH /sesion/:id/cerrar` debe usar el usuario del JWT.
3. `POST /auth/login` debe actualizar `usuario.ultimo_acceso`.
4. `rol-modulo-permiso` debe exigir JWT; era el único controlador del módulo
   sin guardia de autenticación.

## 8. Variables de entorno

```env
SECURITY_API_URL=http://localhost:3001/api
# Alternativa compatible:
NEXT_PUBLIC_RECAUDACIONES_API_URL=http://localhost:3001/api

AUTH_COOKIE_NAME=recaudacion_session
SECURITY_SUPER_ROLE_CODES=ADMIN,ADMINISTRADOR,SUPER_ADMIN
```

`SECURITY_API_URL` solo se lee en el servidor. La URL pública se conserva
para no romper configuraciones existentes, pero el cliente ya no la usa para
autenticar.

## 9. Seguridad aplicada

- Token y contexto en cookies `httpOnly`, `secure` en producción, `sameSite=lax`.
- Sin `localStorage` ni tokens en el HTML.
- Toda llamada HTTP pasa por `cliente-seguridad.ts` en el servidor.
- Los errores del backend se traducen a mensajes genéricos; no se exponen
  rutas, SQL ni detalles de validación.
- El login devuelve el mismo mensaje para usuario inexistente y contraseña
  incorrecta. Un usuario LDAP válido pero sin registro activo en
  `seguridad.usuario` recibe un mensaje de "sin acceso", sin detalle interno.
- La IP se valida antes de enviarla a una columna `inet`.

## 10. Verificación

```bash
pnpm install
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Requiere el backend en `SECURITY_API_URL` y el seed aplicado para que el
primer administrador vea los módulos.
