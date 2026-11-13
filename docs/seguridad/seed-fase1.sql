-- ============================================================================
-- Fase 1 — Seed del catálogo de seguridad
-- ----------------------------------------------------------------------------
-- Crea los módulos y permisos que usan las pantallas de seguridad y los
-- asigna al rol ADMINISTRADOR. Es idempotente: puede ejecutarse varias veces.
--
-- Antes de ejecutarlo:
--   1. Debe existir al menos un usuario ACTIVO en seguridad.usuario.
--   2. Cambia 'juan.perez' por el username del administrador real.
--   3. Ejecuta con un rol de base de datos que pueda escribir en el esquema
--      seguridad (por ejemplo, el mismo usuario de la aplicación).
--
--   psql -h localhost -U <usuario> -d <base> -f seed-fase1.sql
-- ============================================================================

DO $$
DECLARE
  v_admin      uuid;
  v_rol        uuid;
  v_username   text := 'juan.perez'; -- ← AJUSTA ESTE USERNAME
BEGIN
  -- Administrador responsable de la auditoría de los registros sembrados.
  SELECT id INTO v_admin
  FROM seguridad.usuario
  WHERE username = v_username
    AND estado = 'ACTIVO'
    AND deleted_at IS NULL;

  IF v_admin IS NULL THEN
    SELECT id INTO v_admin
    FROM seguridad.usuario
    WHERE estado = 'ACTIVO' AND deleted_at IS NULL
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF v_admin IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios activos en seguridad.usuario. Crea el administrador antes de sembrar el catálogo.';
  END IF;

  -- --------------------------------------------------------------------------
  -- Módulos
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.modulo (nombre, codigo, descripcion, ruta, estado, _user_created)
  VALUES
    ('Usuarios',  'USUARIOS',  'Administración de usuarios del sistema.',        '/seguridad/usuarios',  'ACTIVO', v_admin),
    ('Roles',     'ROLES',     'Roles funcionales y asignación de permisos.',    '/seguridad/roles',     'ACTIVO', v_admin),
    ('Módulos',   'MODULOS',   'Catálogo de módulos y rutas de navegación.',     '/seguridad/modulos',   'ACTIVO', v_admin),
    ('Permisos',  'PERMISOS',  'Catálogo de acciones autorizables.',             '/seguridad/permisos',  'ACTIVO', v_admin),
    ('Sesiones',  'SESIONES',  'Historial de accesos del usuario autenticado.',  '/seguridad/sesiones',  'ACTIVO', v_admin)
  ON CONFLICT (codigo) DO UPDATE SET
    nombre        = EXCLUDED.nombre,
    descripcion   = EXCLUDED.descripcion,
    ruta          = EXCLUDED.ruta,
    estado        = 'ACTIVO',
    deleted_at    = NULL,
    updated_at    = now(),
    _user_update  = v_admin;

  -- --------------------------------------------------------------------------
  -- Permisos
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.permiso (codigo, descripcion, estado, _user_created)
  VALUES
    ('USUARIO_VER',         'Consultar el listado y detalle de usuarios.',            'ACTIVO', v_admin),
    ('USUARIO_CREAR',       'Registrar usuarios en el sistema.',                      'ACTIVO', v_admin),
    ('USUARIO_EDITAR',      'Editar los datos de un usuario.',                        'ACTIVO', v_admin),
    ('USUARIO_ESTADO',      'Activar o desactivar usuarios.',                         'ACTIVO', v_admin),
    ('USUARIO_ASIGNAR_ROL', 'Asignar o retirar roles de un usuario.',                 'ACTIVO', v_admin),
    ('ROL_VER',             'Consultar roles y sus permisos.',                        'ACTIVO', v_admin),
    ('ROL_CREAR',           'Registrar roles.',                                       'ACTIVO', v_admin),
    ('ROL_EDITAR',          'Editar roles.',                                          'ACTIVO', v_admin),
    ('ROL_ESTADO',          'Activar o desactivar roles.',                            'ACTIVO', v_admin),
    ('ROL_ASIGNAR_PERMISO', 'Modificar la matriz de permisos de un rol.',             'ACTIVO', v_admin),
    ('MODULO_VER',          'Consultar el catálogo de módulos.',                      'ACTIVO', v_admin),
    ('MODULO_CREAR',        'Registrar módulos.',                                     'ACTIVO', v_admin),
    ('MODULO_EDITAR',       'Editar módulos.',                                        'ACTIVO', v_admin),
    ('MODULO_ESTADO',       'Activar o desactivar módulos.',                          'ACTIVO', v_admin),
    ('PERMISO_VER',         'Consultar el catálogo de permisos.',                     'ACTIVO', v_admin),
    ('PERMISO_CREAR',       'Registrar permisos.',                                    'ACTIVO', v_admin),
    ('PERMISO_EDITAR',      'Editar permisos.',                                       'ACTIVO', v_admin),
    ('PERMISO_ESTADO',      'Activar o desactivar permisos.',                         'ACTIVO', v_admin),
    ('SESION_VER',          'Consultar el historial de sesiones propias.',            'ACTIVO', v_admin),
    ('SESION_CERRAR',       'Cerrar sesiones propias.',                               'ACTIVO', v_admin)
  ON CONFLICT (codigo) DO UPDATE SET
    descripcion   = EXCLUDED.descripcion,
    estado        = 'ACTIVO',
    deleted_at    = NULL,
    updated_at    = now(),
    _user_update  = v_admin;

  -- --------------------------------------------------------------------------
  -- Rol administrador
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.rol (codigo, descripcion, estado, _user_created)
  SELECT 'ADMINISTRADOR',
         'Acceso administrativo completo al sistema.',
         'ACTIVO',
         v_admin
  WHERE NOT EXISTS (
    SELECT 1 FROM seguridad.rol WHERE codigo = 'ADMINISTRADOR'
  );

  SELECT id INTO v_rol
  FROM seguridad.rol
  WHERE codigo = 'ADMINISTRADOR' AND deleted_at IS NULL;

  IF v_rol IS NULL THEN
    RAISE EXCEPTION 'No se pudo crear u obtener el rol ADMINISTRADOR.';
  END IF;

  -- --------------------------------------------------------------------------
  -- Matriz rol – módulo – permiso
  -- Cada permiso se asigna al módulo de su dominio.
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.rol_modulo_permiso
    (rol_id, modulo_id, permiso_id, estado, user_created)
  SELECT v_rol, m.id, p.id, 'ACTIVO', v_admin
  FROM seguridad.modulo m
  JOIN seguridad.permiso p
    ON (m.codigo = 'USUARIOS'  AND p.codigo LIKE 'USUARIO\_%' ESCAPE '\')
    OR (m.codigo = 'ROLES'     AND p.codigo LIKE 'ROL\_%'     ESCAPE '\')
    OR (m.codigo = 'MODULOS'   AND p.codigo LIKE 'MODULO\_%'  ESCAPE '\')
    OR (m.codigo = 'PERMISOS'  AND p.codigo LIKE 'PERMISO\_%' ESCAPE '\')
    OR (m.codigo = 'SESIONES'  AND p.codigo LIKE 'SESION\_%'  ESCAPE '\')
  WHERE m.codigo IN ('USUARIOS', 'ROLES', 'MODULOS', 'PERMISOS', 'SESIONES')
    AND m.deleted_at IS NULL
    AND p.deleted_at IS NULL
  ON CONFLICT (rol_id, modulo_id, permiso_id) DO UPDATE SET
    estado       = 'ACTIVO',
    deleted_at   = NULL,
    updated_at   = now(),
    user_update  = v_admin;

  -- --------------------------------------------------------------------------
  -- Asignación del rol al administrador inicial
  -- --------------------------------------------------------------------------
  INSERT INTO seguridad.usuario_rol
    (usuario_id, rol_id, estado, _user_created)
  VALUES (v_admin, v_rol, 'ACTIVO', v_admin)
  ON CONFLICT (usuario_id, rol_id) DO UPDATE SET
    estado       = 'ACTIVO',
    deleted_at   = NULL,
    _updated_at  = now(),
    _user_update = v_admin;

  RAISE NOTICE 'Seed de seguridad aplicado. Administrador: %', v_admin;
END $$;
