import { createServer } from "node:http";
import assert from "node:assert/strict";
import { test } from "vitest";

test("contrato de login y validación con Seguridad", async () => {
  let omitCrud = false;
  const server = createServer(async (req, res) => {
    if (req.url === "/api/") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const { username, password } = JSON.parse(raw);
      res.setHeader("Content-Type", "application/json");
      if (username === "servicio.caido") {
        res.writeHead(500).end(JSON.stringify({ message: "Error interno" }));
        return;
      }
      if (username !== "usuario.valido" || password !== "clave.valida") {
        res
          .writeHead(401)
          .end(JSON.stringify({ message: "Credenciales inválidas" }));
        return;
      }
      res.writeHead(201).end(
        JSON.stringify({
          access_token: "token-de-prueba",
          expires_at: new Date(Date.now() + 60_000).toISOString(),
          user: { username, name: "Usuario válido" },
        }),
      );
      return;
    }
    if (req.url === "/api/auth/validate-token") {
      res.setHeader("Content-Type", "application/json");
      if (req.headers.authorization !== "Bearer token-de-prueba") {
        res.writeHead(401).end(JSON.stringify({ message: "Token inválido" }));
        return;
      }
      res
        .writeHead(201)
        .end(
          JSON.stringify({ valid: true, user: { username: "usuario.valido" } }),
        );
      return;
    }
    if (req.headers.authorization !== "Bearer token-de-prueba") {
      res.writeHead(401).end();
      return;
    }
    const path = new URL(req.url, "http://localhost").pathname;
    let result;
    if (path === "/api/sistemas/codigo/API_TEMPLATE")
      result = { id: "sistema", activo: true };
    else if (path === "/api/usuarios/username/usuario.valido")
      result = { id: "usuario", activo: true, estado: "ACTIVO" };
    else if (path === "/api/usuarios-roles/usuario/usuario")
      result = [
        {
          rolId: "rol",
          sistemaId: "sistema",
          activo: true,
          _deletedAt: null,
          rol: { activo: true },
          sistema: {
            id: "sistema",
            codigo: "API_TEMPLATE",
            nombre: "Demo",
            activo: true,
          },
        },
      ];
    else if (path === "/api/modulos-sistema/sistema/sistema/activos")
      result = [
        {
          id: "wara",
          codigo: "WARA",
          nombre: "Wara",
          ruta: "/demo/wara",
          orden: 1,
          activo: true,
        },
        {
          id: "crud",
          codigo: "CRUD",
          nombre: "CRUD básico",
          ruta: "/demo/crud",
          orden: 2,
          activo: true,
        },
      ];
    else if (path === "/api/permisos-acceso/usuario/usuario")
      result = [
        {
          permiso: "WARA.LEER",
          sistemaId: "sistema",
          moduloId: "wara",
          rolId: "rol",
          activo: true,
          permitido: true,
        },
        {
          permiso: "CRUD.LEER",
          sistemaId: "sistema",
          moduloId: "crud",
          rolId: "rol",
          activo: true,
          permitido: !omitCrud,
        },
      ];
    else {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.SECURITY_API_URL = `http://127.0.0.1:${server.address().port}/api`;
  process.env.SECURITY_SYSTEM_CODE = "API_TEMPLATE";
  process.env.SECURITY_MODULE_CODES = "WARA,CRUD";
  const { authenticate, validateToken, getPermissions, getSecurityNavigation } =
    await import("./seguridad.service.ts");
  try {
    const ok = await authenticate("usuario.valido", "clave.valida");
    assert.equal(ok.status, "ok");
    assert.equal(await validateToken(ok.token), "ok");
    assert.deepEqual([...(await getPermissions(ok.token))].sort(), [
      "CRUD.LEER",
      "WARA.LEER",
    ]);
    assert.deepEqual(await getSecurityNavigation(ok.token), [
      {
        id: "sistema",
        codigo: "API_TEMPLATE",
        nombre: "Demo",
        modules: [
          {
            id: "wara",
            codigo: "WARA",
            nombre: "Wara",
            descripcion: undefined,
            ruta: "/demo/wara",
            icono: undefined,
            orden: 1,
          },
          {
            id: "crud",
            codigo: "CRUD",
            nombre: "CRUD básico",
            descripcion: undefined,
            ruta: "/demo/crud",
            icono: undefined,
            orden: 2,
          },
        ],
      },
    ]);
    omitCrud = true;
    assert.deepEqual([...(await getPermissions(ok.token))], ["WARA.LEER"]);
    assert.equal(await validateToken("token-falso"), "invalid");
    assert.deepEqual(await authenticate("usuario.valido", "incorrecta"), {
      status: "invalid",
    });
    assert.deepEqual(await authenticate("inexistente", "incorrecta"), {
      status: "invalid",
    });
    assert.deepEqual(await authenticate("servicio.caido", "clave"), {
      status: "unavailable",
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  assert.deepEqual(await authenticate("usuario.valido", "clave.valida"), {
    status: "unavailable",
  });
  assert.equal(await validateToken("token-de-prueba"), "unavailable");
});
