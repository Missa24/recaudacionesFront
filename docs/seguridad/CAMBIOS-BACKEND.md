# Cambios mínimos en el backend (justificación)

El backend se considera completo y **no se reescribe**. Estos cinco ajustes
son necesarios para que la fase 1 no simule la sesión ni el último acceso:

1. `POST /sesion` usaba un UUID fijo (`8b461287-…`) en lugar del usuario del
   JWT, y no devolvía el `id` creado. Sin el `id`, el logout no puede cerrar la
   sesión.
2. `PATCH /sesion/:id/cerrar` usaba el mismo UUID fijo.
3. `POST /auth/login` nunca actualizaba `usuario.ultimo_acceso`.
4. `rol-modulo-permiso` no tenía ninguna guardia: cualquiera podía leer o
   modificar la matriz de permisos sin JWT.
5. Los controladores de catálogos, aranceles y seguridad usan un UUID de
   ejemplo (`8b461287-…`) para la auditoría. Ese UUID **no existe** en la base
   y toda escritura falla por clave foránea (23503). Se resolvió con una
   auditoría transversal por usuario real.

Ningún endpoint nuevo, ninguna migración y ningún cambio de contrato para
consumidores actuales: solo se corrige el origen del usuario y se añade `id`
a la respuesta de creación/cierre.

## 1. `src/modules/auth/auth.module.ts`

```diff
 import { ApiTokensModule } from '../api-tokens/api-tokens.module';
+import { Usuario } from '../seguridad/usuario/entities/usuario.entity';
@@
-    TypeOrmModule.forFeature([ApiToken]),
+    TypeOrmModule.forFeature([ApiToken, Usuario]),
```

## 2. `src/modules/auth/auth.service.ts`

```diff
 import { AdUser, AdGroup, AdUserOptions, AdGroupOptions } from './interfaces/ad.interface';
+import { InjectRepository } from '@nestjs/typeorm';
+import { Repository } from 'typeorm';
+import { Usuario } from '../seguridad/usuario/entities/usuario.entity';
@@
   constructor(
     private jwtService: JwtService,
     private configService: ConfigService,
+    @InjectRepository(Usuario)
+    private readonly usuarioRepository: Repository<Usuario>,
   ) {}
@@
     const token = this.jwtService.sign(payload);
+    await this.actualizarUltimoAcceso(user.username);
@@
     return {
       access_token: token,
@@
     };
   }
+
+  /**
+   * Registra el último acceso del usuario. Es best-effort: un fallo de
+   * escritura no debe impedir el login.
+   */
+  private async actualizarUltimoAcceso(username: string): Promise<void> {
+    try {
+      await this.usuarioRepository.update(
+        { username },
+        { ultimoAcceso: new Date() },
+      );
+    } catch {
+      this.logger.warn(
+        `No se pudo actualizar ultimo_acceso para ${username}`,
+      );
+    }
+  }
```

## 3. `src/modules/seguridad/sesion/dto/create-sesion.dto.ts`

Sustituir el contenido por:

```ts
import { IsIP, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Datos técnicos de la conexión. El usuario propietario y el creador se
 * obtienen del JWT en el controlador, nunca del cuerpo.
 */
export class CreateSesionDto {
  @ApiPropertyOptional({
    description: 'Dirección IP del cliente IPv4 o IPv6.',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsIP(undefined, { message: 'La dirección IP debe ser válida' })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Información del navegador o cliente.',
    example: 'Mozilla/5.0 Chrome/120.0',
  })
  @IsOptional()
  @IsString({ message: 'El user agent debe ser texto' })
  userAgent?: string;
}
```

## 4. `src/modules/seguridad/sesion/interface/sesion-response.interface.ts`

```diff
 export interface SesionMessageResponse {
+  /** UUID de la sesión creada o cerrada. */
+  id: string;
   message: string;
 }
```

## 5. `src/modules/seguridad/sesion/sesion.module.ts`

```diff
 import { Sesion } from './entities/sesion.entity';
+import { Usuario } from '../usuario/entities/usuario.entity';
@@
-  imports: [TypeOrmModule.forFeature([Sesion])],
+  imports: [TypeOrmModule.forFeature([Sesion, Usuario])],
```

## 6. `src/modules/seguridad/sesion/sesion.service.ts`

```diff
 import {
   BadRequestException,
   ConflictException,
   Injectable,
   InternalServerErrorException,
   Logger,
   NotFoundException,
+  UnauthorizedException,
 } from '@nestjs/common';
@@
 import { InjectRepository } from '@nestjs/typeorm';
+import { Usuario } from '../usuario/entities/usuario.entity';
@@
   constructor(
     @InjectRepository(Sesion)
     private readonly sesionRepository: Repository<Sesion>,
+    @InjectRepository(Usuario)
+    private readonly usuarioRepository: Repository<Usuario>,
   ) {}
+
+  /**
+   * Traduce el username del JWT al UUID de `seguridad.usuario`.
+   * El token usa `sub = username`, no el identificador.
+   */
+  private async resolverUsuarioId(username: string): Promise<string> {
+    const usuario = await this.usuarioRepository.findOne({
+      where: { username, estado: 'ACTIVO', deletedAt: IsNull() },
+    });
+    if (!usuario) {
+      throw new UnauthorizedException(
+        'El usuario autenticado no está registrado o está inactivo',
+      );
+    }
+    return usuario.id;
+  }
@@
   async crear(
     dto: CreateSesionDto,
-    idUsuario: string,
+    username: string,
   ): Promise<SesionMessageResponse> {
+    const idUsuario = await this.resolverUsuarioId(username);
     // Prepara la sesión asociando al usuario propietario y creador.
@@
       return {
+        id: sesion.id,
         message: 'Sesión registrada correctamente',
       };
@@
-  async cerrar(id: string, idUsuario: string): Promise<SesionMessageResponse> {
+  async cerrar(id: string, username: string): Promise<SesionMessageResponse> {
+    const idUsuario = await this.resolverUsuarioId(username);
     const sesion = await this.sesionRepository.findOne({
@@
       return {
+        id: sesion.id,
         message: 'Sesión cerrada correctamente',
       };
```

## 7. `src/modules/seguridad/sesion/sesion.controller.ts`

```diff
 import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   Query,
   UseGuards,
+  Req,
+  UnauthorizedException,
 } from '@nestjs/common';
@@
-// Identificador temporal del usuario responsable de las operaciones.
-const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';
+interface UsuarioAutenticado {
+  user?: { username?: string };
+}
@@
-  crear(@Body() dto: CreateSesionDto) {
-    return this.sesionService.crear(dto, userId);
+  crear(@Body() dto: CreateSesionDto, @Req() req: UsuarioAutenticado) {
+    return this.sesionService.crear(dto, this.username(req));
@@
-  cerrar(@Param('id') id: string) {
-    return this.sesionService.cerrar(id, userId);
+  cerrar(@Param('id') id: string, @Req() req: UsuarioAutenticado) {
+    return this.sesionService.cerrar(id, this.username(req));
   }
+
+  /** El JWT de `validate-token` expone el username en `req.user`. */
+  private username(req: UsuarioAutenticado): string {
+    const username = req.user?.username;
+    if (!username) {
+      throw new UnauthorizedException('Usuario no autenticado');
+    }
+    return username;
+  }
```

> `listarMisSesiones` sigue usando `userId` en el controlador actual. Hay que
> cambiarlo a `this.username(req)` y añadir `@Req()`:
>
> ```diff
> -  listarMisSesiones(@Query() query: QuerySesionDto) {
> -    return this.sesionService.listarPorUsuario(userId, query);
> +  listarMisSesiones(
> +    @Query() query: QuerySesionDto,
> +    @Req() req: UsuarioAutenticado,
> +  ) {
> +    return this.sesionService.listarPorUsuario(this.username(req), query);
>    }
> ```
>
> `SesionService.listarPorUsuario` **no** cambia: sigue recibiendo un UUID.

## 8. `src/modules/seguridad/rol-modulo-permiso/rol-modulo-permiso.controller.ts`

Era el único controlador del módulo sin autenticación. Se añade la guardia:

```diff
 import {
   Body,
   Controller,
   Get,
   Param,
   Patch,
   Post,
   Put,
   Query,
+  UseGuards,
 } from '@nestjs/common';
+import { AuthGuard } from '@nestjs/passport';
+import { ApiBearerAuth } from '@nestjs/swagger';
@@
 const idUsuario = '8b461287-8416-412e-84e7-b5c77615ea2a';
+@ApiBearerAuth('JWT')
+@UseGuards(AuthGuard('jwt'))
 @Controller('rol-modulo-permiso')
```

> Nota: este controlador sigue usando `idUsuario` fijo para la auditoría. Si
> ese UUID no existe en `seguridad.usuario`, las escrituras fallarán por FK.
> En la siguiente fase conviene reemplazarlo por el UUID resuelto desde el
> JWT, igual que se hizo en `sesion`.

## 9. Seed del catálogo

Aplicar `docs/seguridad/seed-fase1.sql` después de que exista al menos un
usuario activo en `seguridad.usuario`. Crea módulos, permisos y los asigna al
rol `ADMINISTRADOR` (lo crea si no existe).

## 10. Auditoría por usuario real

Se añadieron tres archivos y dos registros:

- `src/common/auditoria/contexto-auditoria.ts`: `AsyncLocalStorage` con el UUID
  del usuario de la petición.
- `src/common/auditoria/auditoria.subscriber.ts`: antes de insertar o
  actualizar, reemplaza `_user_created`, `_user_update`, `user_created` y
  `user_update` por el UUID real, incluida la relación `usuario_creador`.
- `src/common/auditoria/auditoria.interceptor.ts`: publica el `usuarioId` que
  deja `JwtStrategy` en `req.user`.
- `JwtStrategy` resuelve el UUID desde `seguridad.usuario` a partir del
  `username` del token.
- `AppModule` registra `subscribers: [AuditoriaSubscriber]` y el interceptor
  global.

Así los servicios existentes pueden seguir recibiendo el UUID fijo: el
subscriber lo sobrescribe antes de persistir. La prueba directa contra la base
confirmó que `catalogo.banco._user_created` queda con el UUID autenticado.

## Verificación

```bash
cd recaudaciones-backend
pnpm build
```

El frontend debe iniciar sesión, registrar la fila de sesión con el usuario
correcto y actualizar `ultimo_acceso` en cada login.
