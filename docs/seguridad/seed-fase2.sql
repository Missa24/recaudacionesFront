-- ============================================================================
-- Fase 2 — Seed de módulos y permisos de Catálogos y Aranceles
-- ----------------------------------------------------------------------------
-- Requiere haber ejecutado seed-fase1.sql (rol ADMINISTRADOR y un usuario
-- administrador). Es idempotente.
--
--   psql -h localhost -U <usuario> -d <base> -f seed-fase2.sql
-- ============================================================================

DO $$
DECLARE
  v_admin uuid;
  v_rol   uuid;
BEGIN
  SELECT id INTO v_admin
  FROM seguridad.usuario
  WHERE estado = 'ACTIVO' AND deleted_at IS NULL
  ORDER BY created_at
  LIMIT 1;

  IF v_admin IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios activos en seguridad.usuario.';
  END IF;

  SELECT id INTO v_rol
  FROM seguridad.rol
  WHERE codigo = 'ADMINISTRADOR' AND deleted_at IS NULL;

  IF v_rol IS NULL THEN
    RAISE EXCEPTION 'Ejecuta seed-fase1.sql antes: falta el rol ADMINISTRADOR.';
  END IF;

  -- --------------------------------------------------------------------------
  -- Módulos de navegación
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.modulo (nombre, codigo, descripcion, ruta, estado, _user_created)
  VALUES
    ('Catálogos',  'CATALOGOS', 'Datos maestros de bancos, cuentas, personas y calendario.', '/catalogo', 'ACTIVO', v_admin),
    ('Aranceles',  'ARANCELES', 'Tipos de trámite, aranceles, tarifas y requisitos.',        '/arancel',  'ACTIVO', v_admin)
  ON CONFLICT (codigo) DO UPDATE SET
    nombre       = EXCLUDED.nombre,
    descripcion  = EXCLUDED.descripcion,
    ruta         = EXCLUDED.ruta,
    estado       = 'ACTIVO',
    deleted_at   = NULL,
    updated_at   = now(),
    _user_update = v_admin;

  -- --------------------------------------------------------------------------
  -- Permisos: VER consulta, GESTIONAR crea/edita/cambia estado
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.permiso (codigo, descripcion, estado, _user_created)
  VALUES
    ('BANCO_VER',                   'Consultar bancos.',                              'ACTIVO', v_admin),
    ('BANCO_GESTIONAR',             'Crear, editar y cambiar estado de bancos.',       'ACTIVO', v_admin),
    ('CUENTA_BANCARIA_VER',         'Consultar cuentas bancarias.',                   'ACTIVO', v_admin),
    ('CUENTA_BANCARIA_GESTIONAR',   'Crear, editar y cambiar estado de cuentas.',      'ACTIVO', v_admin),
    ('DEPENDENCIA_VER',             'Consultar dependencias.',                        'ACTIVO', v_admin),
    ('DEPENDENCIA_GESTIONAR',       'Crear, editar y cambiar estado de dependencias.', 'ACTIVO', v_admin),
    ('INTERES_VER',                 'Consultar intereses.',                           'ACTIVO', v_admin),
    ('INTERES_GESTIONAR',           'Crear, editar y cambiar estado de intereses.',    'ACTIVO', v_admin),
    ('CALENDARIO_VER',              'Consultar el calendario.',                       'ACTIVO', v_admin),
    ('CALENDARIO_GESTIONAR',        'Crear, editar y cambiar estado de fechas.',       'ACTIVO', v_admin),
    ('PERSONA_NATURAL_VER',         'Consultar personas naturales.',                  'ACTIVO', v_admin),
    ('PERSONA_NATURAL_GESTIONAR',   'Crear, editar y cambiar estado de personas naturales.', 'ACTIVO', v_admin),
    ('PERSONA_JURIDICA_VER',        'Consultar personas jurídicas.',                  'ACTIVO', v_admin),
    ('PERSONA_JURIDICA_GESTIONAR',  'Crear, editar y cambiar estado de personas jurídicas.', 'ACTIVO', v_admin),
    ('REQUISITO_VER',               'Consultar requisitos.',                          'ACTIVO', v_admin),
    ('REQUISITO_GESTIONAR',         'Crear, editar y cambiar estado de requisitos.',   'ACTIVO', v_admin),
    ('UFV_VER',                     'Consultar valores UFV.',                         'ACTIVO', v_admin),
    ('UFV_GESTIONAR',               'Crear, editar, sincronizar y cambiar estado de UFV.', 'ACTIVO', v_admin),
    ('TIPO_TRAMITE_VER',            'Consultar tipos de trámite.',                    'ACTIVO', v_admin),
    ('TIPO_TRAMITE_GESTIONAR',      'Crear, editar y cambiar estado de tipos de trámite.', 'ACTIVO', v_admin),
    ('ARANCEL_GENERAL_VER',         'Consultar aranceles generales.',                 'ACTIVO', v_admin),
    ('ARANCEL_GENERAL_GESTIONAR',   'Crear, editar y cambiar estado de aranceles.',    'ACTIVO', v_admin),
    ('ARANCEL_DETALLE_VER',         'Consultar detalles de arancel.',                 'ACTIVO', v_admin),
    ('ARANCEL_DETALLE_GESTIONAR',   'Crear, editar y cambiar estado de detalles.',     'ACTIVO', v_admin),
    ('TARIFA_VER',                  'Consultar tarifas.',                             'ACTIVO', v_admin),
    ('TARIFA_GESTIONAR',            'Crear, editar y cambiar estado de tarifas.',      'ACTIVO', v_admin),
    ('ARANCEL_RANGO_VER',           'Consultar rangos de tarifa.',                    'ACTIVO', v_admin),
    ('ARANCEL_RANGO_GESTIONAR',     'Crear, editar y cambiar estado de rangos.',       'ACTIVO', v_admin),
    ('ARANCEL_REQUISITO_VER',       'Consultar requisitos de trámite.',               'ACTIVO', v_admin),
    ('ARANCEL_REQUISITO_GESTIONAR', 'Crear, editar y cambiar estado de requisitos de trámite.', 'ACTIVO', v_admin)
  ON CONFLICT (codigo) DO UPDATE SET
    descripcion  = EXCLUDED.descripcion,
    estado       = 'ACTIVO',
    deleted_at   = NULL,
    updated_at   = now(),
    _user_update = v_admin;

  -- --------------------------------------------------------------------------
  -- Matriz rol – módulo – permiso
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.rol_modulo_permiso
    (rol_id, modulo_id, permiso_id, estado, user_created)
  SELECT v_rol, m.id, p.id, 'ACTIVO', v_admin
  FROM seguridad.modulo m
  JOIN seguridad.permiso p
    ON (m.codigo = 'CATALOGOS' AND (
          p.codigo LIKE 'BANCO\_%' ESCAPE '\'
       OR p.codigo LIKE 'CUENTA\_BANCARIA\_%' ESCAPE '\'
       OR p.codigo LIKE 'DEPENDENCIA\_%' ESCAPE '\'
       OR p.codigo LIKE 'INTERES\_%' ESCAPE '\'
       OR p.codigo LIKE 'CALENDARIO\_%' ESCAPE '\'
       OR p.codigo LIKE 'PERSONA\_NATURAL\_%' ESCAPE '\'
       OR p.codigo LIKE 'PERSONA\_JURIDICA\_%' ESCAPE '\'
       OR p.codigo LIKE 'REQUISITO\_%' ESCAPE '\'
       OR p.codigo LIKE 'UFV\_%' ESCAPE '\'
       ))
    OR (m.codigo = 'ARANCELES' AND (
          p.codigo LIKE 'TIPO\_TRAMITE\_%' ESCAPE '\'
       OR p.codigo LIKE 'ARANCEL\_GENERAL\_%' ESCAPE '\'
       OR p.codigo LIKE 'ARANCEL\_DETALLE\_%' ESCAPE '\'
       OR p.codigo LIKE 'TARIFA\_%' ESCAPE '\'
       OR p.codigo LIKE 'ARANCEL\_RANGO\_%' ESCAPE '\'
       OR p.codigo LIKE 'ARANCEL\_REQUISITO\_%' ESCAPE '\'
       ))
  WHERE m.codigo IN ('CATALOGOS', 'ARANCELES')
    AND m.deleted_at IS NULL
    AND p.deleted_at IS NULL
  ON CONFLICT (rol_id, modulo_id, permiso_id) DO UPDATE SET
    estado      = 'ACTIVO',
    deleted_at  = NULL,
    updated_at  = now(),
    user_update = v_admin;

  RAISE NOTICE 'Seed fase 2 aplicado. Administrador: %', v_admin;
END $$;
