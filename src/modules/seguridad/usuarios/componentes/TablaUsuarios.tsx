"use client";

import { useMemo, useState } from "react";
import { Alert, Stack } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { DataTable } from "@/common/components/DataTable";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { useToast } from "@/common/components/ToastProvider";
import { PERMISOS } from "../../comun/constantes";
import { useSession } from "../../auth/componentes/SessionProvider";
import { useListadoSeguridad } from "../../comun/hooks/useListadoSeguridad";
import { EtiquetaEstado } from "../../comun/componentes/EtiquetaEstado";
import {
  DialogoFormulario,
  SelectorEstado,
  type CampoFormulario,
} from "../../comun/componentes/DialogoFormulario";
import { formatearFechaHora, nombreDeUsuario, textoOMa } from "../../comun/utilidades";
import type { UsuarioSeguridad } from "../tipos";
import {
  actualizarUsuarioAction,
  cambiarEstadoUsuarioAction,
  crearUsuarioAction,
  listarUsuariosAction,
} from "../acciones";
import { DialogoRolesUsuario } from "./DialogoRolesUsuario";

/**
 * Módulo: Seguridad / Usuarios
 * Archivo: TablaUsuarios.tsx
 *
 * Listado paginado con búsqueda, filtro por estado y acciones de alta,
 * edición, cambio de estado y asignación de roles. Los botones se ocultan
 * según permisos, pero cada acción vuelve a validarlos en el servidor.
 */

const CAMPOS: CampoFormulario[] = [
  { nombre: "username", etiqueta: "Usuario", requerido: true, maxLength: 50, ayuda: "Debe coincidir con el usuario de LDAP." },
  { nombre: "email", etiqueta: "Correo electrónico", tipo: "email", requerido: true, maxLength: 255 },
  { nombre: "ci", etiqueta: "CI", requerido: true, maxLength: 30 },
  { nombre: "nombres", etiqueta: "Nombres", maxLength: 100 },
  { nombre: "apellido_paterno", etiqueta: "Apellido paterno", maxLength: 100 },
  { nombre: "apellido_materno", etiqueta: "Apellido materno", maxLength: 100 },
  { nombre: "celular", etiqueta: "Celular", tipo: "tel", maxLength: 20 },
];

function valoresDe(usuario: UsuarioSeguridad | null): Record<string, string> {
  return {
    username: usuario?.username ?? "",
    email: usuario?.email ?? "",
    ci: usuario?.ci ?? "",
    nombres: usuario?.nombres ?? "",
    apellido_paterno: usuario?.apellido_paterno ?? "",
    apellido_materno: usuario?.apellido_materno ?? "",
    celular: usuario?.celular ?? "",
  };
}

export function TablaUsuarios() {
  const { puede } = useSession();
  const toast = useToast();
  const listado = useListadoSeguridad(listarUsuariosAction, {
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const [formulario, setFormulario] = useState<{
    abierto: boolean;
    usuario: UsuarioSeguridad | null;
  }>({ abierto: false, usuario: null });
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const [usuarioRoles, setUsuarioRoles] = useState<UsuarioSeguridad | null>(null);
  const [porCambiarEstado, setPorCambiarEstado] = useState<UsuarioSeguridad | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const columnas = useMemo<GridColDef<UsuarioSeguridad>[]>(
    () => [
      {
        field: "username",
        headerName: "Usuario",
        minWidth: 150,
        flex: 0.8,
        valueGetter: (_valor, fila) => textoOMa(fila.username),
      },
      {
        field: "nombre",
        headerName: "Nombre completo",
        minWidth: 220,
        flex: 1.2,
        valueGetter: (_valor, fila) => nombreDeUsuario(fila),
      },
      {
        field: "email",
        headerName: "Correo",
        minWidth: 210,
        flex: 1.1,
      },
      { field: "ci", headerName: "CI", minWidth: 110, flex: 0.5 },
      {
        field: "estado",
        headerName: "Estado",
        minWidth: 110,
        flex: 0.5,
        sortable: false,
        renderCell: (parametros) => <EtiquetaEstado estado={parametros.row.estado} />,
      },
      {
        field: "ultimo_acceso",
        headerName: "Último acceso",
        minWidth: 165,
        flex: 0.9,
        valueGetter: (_valor, fila) => formatearFechaHora(fila.ultimo_acceso),
      },
      {
        field: "acciones",
        type: "actions",
        headerName: "Acciones",
        width: 130,
        sortable: false,
        filterable: false,
        getActions: (parametros) => {
          const acciones = [];
          if (puede(PERMISOS.usuarioEditar)) {
            acciones.push(
              <GridActionsCellItem
                key="editar"
                icon={<EditOutlinedIcon />}
                label="Editar"
                onClick={() => {
                  setErrorFormulario(null);
                  setFormulario({ abierto: true, usuario: parametros.row });
                }}
              />,
            );
          }
          if (puede(PERMISOS.usuarioAsignarRol)) {
            acciones.push(
              <GridActionsCellItem
                key="roles"
                icon={<ManageAccountsOutlinedIcon />}
                label="Gestionar roles"
                onClick={() => setUsuarioRoles(parametros.row)}
              />,
            );
          }
          if (puede(PERMISOS.usuarioEstado)) {
            acciones.push(
              <GridActionsCellItem
                key="estado"
                icon={
                  parametros.row.estado === "ACTIVO" ? (
                    <BlockOutlinedIcon />
                  ) : (
                    <CheckCircleOutlineOutlinedIcon />
                  )
                }
                label={parametros.row.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                onClick={() => setPorCambiarEstado(parametros.row)}
              />,
            );
          }
          return acciones;
        },
      },
    ],
    [puede],
  );

  const guardar = async (valores: Record<string, string>) => {
    setGuardando(true);
    setErrorFormulario(null);

    const datos = {
      username: valores.username,
      email: valores.email,
      ci: valores.ci,
      nombres: valores.nombres,
      apellidoPaterno: valores.apellido_paterno,
      apellidoMaterno: valores.apellido_materno,
      celular: valores.celular,
    };

    const resultado = formulario.usuario
      ? await actualizarUsuarioAction(formulario.usuario.id, datos)
      : await crearUsuarioAction(datos);

    setGuardando(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setFormulario({ abierto: false, usuario: null });
      listado.recargar();
    } else {
      setErrorFormulario(resultado.mensaje);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!porCambiarEstado) return;
    setCambiandoEstado(true);
    const resultado = await cambiarEstadoUsuarioAction(porCambiarEstado.id);
    setCambiandoEstado(false);
    if (resultado.ok) {
      toast.success(resultado.mensaje);
      setPorCambiarEstado(null);
      listado.recargar();
    } else {
      toast.error(resultado.mensaje);
    }
  };

  return (
    <>
      {listado.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {listado.error}
        </Alert>
      ) : null}

      <DataTable<UsuarioSeguridad>
        rows={listado.filas}
        columns={columnas}
        loading={listado.cargando}
        meta={listado.paginacion}
        search={listado.busqueda}
        onSearchChange={listado.setBusqueda}
        searchPlaceholder="Buscar por usuario, nombre, correo o CI…"
        onPaginationChange={listado.cambiarPagina}
        onSortChange={(modelo) =>
          listado.cambiarOrden(
            modelo[0]?.field,
            modelo[0]?.sort === "asc" ? "ASC" : "DESC",
          )
        }
        onCreate={
          puede(PERMISOS.usuarioCrear)
            ? () => {
                setErrorFormulario(null);
                setFormulario({ abierto: true, usuario: null });
              }
            : undefined
        }
        createLabel="Nuevo usuario"
        extraToolbar={
          <Stack direction="row" sx={{ gap: 1 }}>
            <SelectorEstado
              valor={String(listado.parametros.status ?? "TODOS")}
              onChange={(valor) => listado.actualizarFiltro("status", valor)}
            />
          </Stack>
        }
      />

      <DialogoFormulario
        abierto={formulario.abierto}
        titulo={formulario.usuario ? "Editar usuario" : "Nuevo usuario"}
        campos={CAMPOS}
        valoresIniciales={valoresDe(formulario.usuario)}
        guardando={guardando}
        error={errorFormulario}
        textoGuardar={formulario.usuario ? "Guardar cambios" : "Registrar"}
        onCerrar={() => {
          if (!guardando) setFormulario({ abierto: false, usuario: null });
        }}
        onGuardar={guardar}
      />

      <DialogoRolesUsuario
        usuario={usuarioRoles}
        abierto={usuarioRoles !== null}
        onCerrar={() => setUsuarioRoles(null)}
        onGuardado={listado.recargar}
      />

      <ConfirmDialog
        open={porCambiarEstado !== null}
        title={
          porCambiarEstado?.estado === "ACTIVO"
            ? "Desactivar usuario"
            : "Activar usuario"
        }
        message={
          porCambiarEstado
            ? `¿Confirmas ${
                porCambiarEstado.estado === "ACTIVO" ? "desactivar" : "activar"
              } a ${nombreDeUsuario(porCambiarEstado)}?`
            : ""
        }
        confirmLabel={porCambiarEstado?.estado === "ACTIVO" ? "Desactivar" : "Activar"}
        confirmColor={porCambiarEstado?.estado === "ACTIVO" ? "error" : "success"}
        loading={cambiandoEstado}
        onCancel={() => setPorCambiarEstado(null)}
        onConfirm={confirmarCambioEstado}
      />
    </>
  );
}
