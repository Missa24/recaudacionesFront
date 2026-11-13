# Contrato de API asumido — Fase 1

Todos los endpoints viven bajo el prefijo global `/api` del backend NestJS.
Las respuestas exitosas pasan por `ResponseInterceptor`:

```json
{ "success": true, "status": 200, "data": { } }
```

Los errores no usan ese envelope; NestJS devuelve
`{ "statusCode": 401, "message": "…", "error": "Unauthorized" }`.
El frontend solo consume `data` y traduce los errores a mensajes genéricos.

## Autenticación

| Método | Ruta | Cuerpo / cabecera | `data` esperado |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ username, password }` | `{ access_token, expires_in, expires_at, token_type, user: { username, name, email, roles } }` |
| POST | `/auth/validate-token` | `Authorization: Bearer <jwt>` | `{ valid: true, user: { username, name, email, roles } }` |

- `expires_at` es ISO 8601 y se usa como expiración de las cookies.
- El JWT trae `sub = username` (no el UUID). Por eso el frontend resuelve el
  UUID con `/usuarios/username/:username`.
- `user.roles` del JWT son grupos de LDAP, **no** códigos de `seguridad.rol`.
  La autorización real se calcula desde la base de datos.

## Autorización

| Método | Ruta | `data` esperado |
| --- | --- | --- |
| GET | `/usuarios/username/:username` | `UsuarioResponse` (`id`, `username`, `email`, `ci`, `nombres`, apellidos, `estado`, `ultimo_acceso`, …) |
| GET | `/usuario-rol/usuario/:usuario_id` | `{ usuario_id, roles: [{ id, codigo, descripcion }] }` |
| GET | `/rol-modulo-permiso/rol/:rolId/permisos` | `{ rol: { id, codigo, descripcion }, modulos: [{ id, nombre, codigo, ruta, permisos: [{ id, codigo, descripcion }] }] }` |

La unión de `modulos[].permisos[].codigo` de todos los roles activos es el
conjunto de permisos efectivos de la sesión.

## Sesiones

| Método | Ruta | Cuerpo | `data` esperado |
| --- | --- | --- | --- |
| POST | `/sesion` | `{ ipAddress?, userAgent? }` | `{ id, message }` *(requiere ajuste)* |
| PATCH | `/sesion/:id/cerrar` | — | `{ id, message }` *(requiere ajuste)* |
| GET | `/sesion/mis-sesiones?page=&limit=&sortBy=&sortOrder=&status=` | — | `{ items: SesionResponse[], pagination: { total, page, limit, totalPages, hasNextPage, hasPreviousPage } }` |

`SesionResponse`:

```json
{
  "id": "uuid",
  "usuario_id": "uuid",
  "username": "juan.perez",
  "inicio": "2026-11-12T14:00:00.000Z",
  "fin": null,
  "ipAddress": "10.0.0.5",
  "userAgent": "Mozilla/5.0…",
  "estado": "ACTIVO",
  "responsable_creacion": "juan.perez",
  "responsable_actualizacion": null
}
```

> **Importante:** `ipAddress` viaja en camelCase aunque la columna sea
> `ip_address`. El frontend respeta ese nombre.

## Administración

| Recurso | Listado | Crear | Actualizar | Estado |
| --- | --- | --- | --- | --- |
| Usuarios | `GET /usuarios` | `POST /usuarios` | `PATCH /usuarios/:id` | `PATCH /usuarios/:id/estado` |
| Roles | `GET /rol` | `POST /rol` | `PATCH /rol/:id` | `PATCH /rol/:id/estado` |
| Módulos | `GET /modulo` | `POST /modulo` | `PATCH /modulo/:id` | `PATCH /modulo/:id/estado` |
| Permisos | `GET /permiso` | `POST /permiso` | `PATCH /permiso/:id` | `PATCH /permiso/:id/estado` |

Listados: `page`, `limit` (máx. 100), `search`, `sortBy`, `sortOrder`,
`status` (`ACTIVO | INACTIVO | TODOS`). Devuelven
`{ items, pagination }`.

### Asignación de roles a un usuario

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| POST | `/usuario-rol/usuario/:usuario_id/roles` | `{ roles: string[] }` (UUID, mínimo 1) |
| PATCH | `/usuario-rol/usuario/:usuario_id/desactivar-roles` | `{ roles: string[] }` (UUID, mínimo 1) |

### Permisos por rol y módulo

| Método | Ruta | Cuerpo |
| --- | --- | --- |
| GET | `/rol-modulo-permiso/catalogo` | — → `{ modulos: [...], permisos: [...] }` |
| PUT | `/rol-modulo-permiso/rol/:rolId/modulo/:moduloId/reemplazar` | `{ permisos: string[] }` (vacío = desactivar todos) |

### DTO de escritura (camelCase)

- Usuario: `username?`, `email`, `ci`, `nombres?`, `apellidoPaterno?`,
  `apellidoMaterno?`, `celular?`.
- Rol: `codigo` (`^[A-Z0-9_]{1,40}$`), `descripcion`.
- Módulo: `nombre`, `codigo`, `descripcion?`, `ruta`.
- Permiso: `codigo`, `descripcion`.

## Supuestos

1. El backend mantiene el prefijo `/api` y el envelope `success/status/data`.
2. `GET /rol-modulo-permiso/rol/:id/permisos` responde 404 si el rol no
   existe o está inactivo; el frontend lo trata como rol sin permisos.
3. `GET /usuario-rol/usuario/:id` devuelve 404 si el usuario no existe; el
   frontend lo trata como sin roles.
4. El usuario autenticado en LDAP debe tener una fila activa en
   `seguridad.usuario`; de lo contrario el login se rechaza con el mensaje
   "Tu usuario no tiene acceso al sistema de recaudaciones."
5. No existe endpoint de refresh: la expiración del JWT es fija
   (`JWT_EXPIRES_IN`, por defecto `1d`). El frontend solo recalcula permisos,
   no renueva el token.
6. No existe endpoint de logout: el cierre local borra cookies y, si hay
   `sesion_id`, cierra la fila con `PATCH /sesion/:id/cerrar`.
