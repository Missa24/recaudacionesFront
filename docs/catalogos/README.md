# Catálogos y Aranceles — Fase 2

Implementación frontend de los esquemas `catalogo` y `arancel` sobre el
backend NestJS existente, reutilizando la arquitectura de la fase 1.

## 1. Catálogos

| Recurso | Ruta frontend | Endpoints backend |
| --- | --- | --- |
| Bancos | `/catalogo/bancos` | `GET/POST /banco`, `PATCH /banco/:id`, `PATCH /banco/:id/estado` |
| Cuentas bancarias | `/catalogo/cuentas-bancarias` | `GET/POST /cuenta-bancaria`, `PATCH /cuenta-bancaria/:id`, `PATCH /cuenta-bancaria/:id/estado` |
| Dependencias | `/catalogo/dependencias` | `GET/POST /dependencia`, `PATCH /dependencia/:id`, `PATCH /dependencia/estado/:id` |
| Intereses | `/catalogo/intereses` | `GET/POST /interes`, `PATCH /interes/:id`, `PATCH /interes/:id/estado` |
| Calendario | `/catalogo/calendario` | `GET/POST /catalogos/calendario`, `PATCH /catalogos/calendario/:id`, `PATCH /catalogos/calendario/:id/estado` |
| Personas naturales | `/catalogo/personas-naturales` | `GET/POST /catalogos/personas-naturales`, … |
| Personas jurídicas | `/catalogo/personas-juridicas` | `GET/POST /catalogos/personas-juridicas`, … |
| Requisitos | `/catalogo/requisitos` | `GET/POST /requisito`, … |
| UFV | `/catalogo/ufv` | `GET/POST /ufv`, `POST /ufv/sincronizar`, … |

## 2. Aranceles

| Recurso | Ruta frontend | Endpoints backend |
| --- | --- | --- |
| Tipos de trámite | `/arancel/tipos-tramite` | `GET/POST /tipo-tramite-catalogo`, … |
| Aranceles generales | `/arancel/aranceles` | `GET/POST /arancel-general`, … |
| Detalles de arancel | `/arancel/detalles` | `GET/POST /arancel-detalle`, … |
| Tarifas | `/arancel/tarifas` | `GET/POST /tarifa`, … |
| Rangos | `/arancel/rangos` | `GET/POST /arancel-rango`, … |
| Requisitos del trámite | `/arancel/requisitos` | `GET/POST /arancel-requisito`, … |

## 3. Permisos

Cada recurso usa dos códigos:

- `X_VER`: consultar el listado y las opciones de los selects.
- `X_GESTIONAR`: crear, editar y cambiar estado.

El seed [`docs/seguridad/seed-fase2.sql`](../seguridad/seed-fase2.sql) crea los
30 permisos, los módulos `CATALOGOS` y `ARANCELES`, y los asigna a
`ADMINISTRADOR`.

## 4. Estructura

```
src/modules/catalogo/
├── tipos.ts
├── acciones.ts                 # Server Actions (CRUD + estado)
├── servidor/servicio-catalogo.ts
└── componentes/
    ├── CatalogoOpciones.tsx    # bancos y dependencias precargados
    ├── TablaCatalogosSimples.tsx
    └── TablaCatalogosRelacionados.tsx

src/modules/arancel/
├── tipos.ts
├── acciones.ts
├── servidor/servicio-arancel.ts
└── componentes/
    ├── ArancelOpciones.tsx
    └── TablasArancel.tsx

src/common/crud/
├── tipos.ts                    # CampoFormulario, ValoresFormulario
├── DialogoFormulario.tsx       # formulario genérico
└── TablaRecurso.tsx            # listado + diálogos + estado
```

Cada página `page.tsx` es un Server Component que exige `X_VER` antes de
renderizar. Las tablas son client components que consumen Server Actions; el
JWT sigue en cookie httpOnly.

## 5. Decisiones

- Los selects de relaciones se cargan una vez en el layout del área
  (`CatalogoOpcionesProvider` / `ArancelOpcionesProvider`), no por fila.
- Las columnas de relación muestran el nombre legible usando esas opciones;
  si no se encuentra, muestran el UUID.
- `TablaRecurso` centraliza búsqueda, paginación, orden, alta, edición,
  confirmación de estado y mensajes.
- La auditoría de todas las escrituras se resolvió en el backend con un
  subscriber global (ver `CAMBIOS-BACKEND.md`), porque el UUID fijo de los
  controladores no existía en la base.

## 6. Pendientes conscientes

- El endpoint `POST /catalogos/calendario/rango` existe pero la interfaz solo
  da de alta fechas individuales; falta el diálogo de rango.
- La sincronización de UFV recarga la página al terminar; puede convertirse en
  una recarga de tabla sin `window.location.reload()`.
- El backend aún no valida permisos por endpoint: la protección de esta fase
  es de frontend (páginas + Server Actions). Ver riesgos en la entrega.
