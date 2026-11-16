"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import HomeRounded from "@mui/icons-material/HomeRounded";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import MenuRounded from "@mui/icons-material/MenuRounded";
import {
  AccountBalanceOutlined,
  AdminPanelSettingsOutlined,
  DashboardOutlined,
  DevicesOutlined,
  PeopleAltOutlined,
  ReceiptLongOutlined,
  ShieldOutlined,
  ViewModuleOutlined,
  VpnKeyOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { ModuloNavegacion } from "@/modules/seguridad/modulos/tipos";
import { useSession } from "@/modules/seguridad/auth/componentes/SessionProvider";
import { cerrarSesionAction } from "@/modules/seguridad/auth/acciones";

const expandedWidth = 272;
const collapsedWidth = 76;
const headerHeight = 72;

/** Icono asociado al código del módulo, con un valor por defecto. */
function iconoDeModulo(codigo: string): React.ReactNode {
  switch (codigo.toUpperCase()) {
    case "USUARIOS":
      return <PeopleAltOutlined fontSize="small" />;
    case "ROLES":
      return <AdminPanelSettingsOutlined fontSize="small" />;
    case "MODULOS":
      return <ViewModuleOutlined fontSize="small" />;
    case "PERMISOS":
      return <VpnKeyOutlined fontSize="small" />;
    case "SESIONES":
      return <DevicesOutlined fontSize="small" />;
    case "SEGURIDAD":
      return <ShieldOutlined fontSize="small" />;
    case "RECAUDACIONES":
      return <ReceiptLongOutlined fontSize="small" />;
    case "TESORERIA":
      return <AccountBalanceOutlined fontSize="small" />;
    default:
      return <DashboardOutlined fontSize="small" />;
  }
}

/** Comprueba si una ruta del menú corresponde a la ruta actual. */
function rutaActiva(pathname: string, ruta: string): boolean {
  if (ruta === "/") return pathname === "/";
  return pathname === ruta || pathname.startsWith(`${ruta}/`);
}

/**
 * Módulo: Seguridad / Shell
 * Archivo: application-shell.tsx
 *
 * Marco visual de la aplicación autenticada. Construye el menú con los
 * módulos que el backend autorizó para el usuario y muestra su identidad
 * y roles. Cerrar sesión invoca la Server Action que también cierra la
 * fila de `seguridad.sesion` en el backend.
 */
export function ApplicationShell({
  modulos,
  children,
}: {
  modulos: ModuloNavegacion[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const sesion = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = collapsed ? collapsedWidth : expandedWidth;

  // Accesos de arranque para el superusuario mientras el catálogo de módulos
  // todavía no tiene sembradas las áreas de catálogos y aranceles.
  const modulosVisibles = sesion.esSuperusuario
    ? [
        ...modulos,
        ...[
          { id: "modulo-catalogos", codigo: "CATALOGOS", nombre: "Catálogos", ruta: "/catalogo", descripcion: null },
          { id: "modulo-aranceles", codigo: "ARANCELES", nombre: "Aranceles", ruta: "/arancel", descripcion: null },
        ].filter((fijo) => !modulos.some((modulo) => modulo.ruta === fijo.ruta)),
      ]
    : modulos;

  const navigation = (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ px: collapsed ? 1 : 2, pt: 2.5, pb: 1 }}>
        {!collapsed && (
          <Typography
            variant="overline"
            sx={{
              color: "text.secondary",
              fontWeight: 800,
              letterSpacing: 1.4,
            }}
          >
            Navegación
          </Typography>
        )}
      </Box>

      <List sx={{ px: 1.25, py: 0 }}>
        <Tooltip title={collapsed ? "Principal" : ""} placement="right">
          <ListItemButton
            component={Link}
            href="/"
            selected={pathname === "/"}
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, minHeight: 48, px: 1.25 }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 36 : 48 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#e1f1f7",
                  color: "primary.main",
                }}
              >
                <HomeRounded fontSize="small" />
              </Avatar>
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Principal"
                slotProps={{ primary: { sx: { fontWeight: 750 } } }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </List>

      <Divider sx={{ mx: 2, my: 1.5 }} />

      <List sx={{ px: 1.25, py: 0, flex: 1, overflowY: "auto" }}>
        {modulosVisibles.length === 0 ? (
          !collapsed && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1.5 }}>
              Sin módulos asignados.
            </Typography>
          )
        ) : (
          modulosVisibles.map((modulo) => (
            <Tooltip
              key={modulo.id}
              title={collapsed ? modulo.nombre : ""}
              placement="right"
            >
              <ListItemButton
                component={Link}
                href={modulo.ruta}
                selected={rutaActiva(pathname, modulo.ruta)}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 2, minHeight: 48, px: 1.25, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 36 : 48 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "#e1f1f7",
                      color: "primary.main",
                    }}
                  >
                    {iconoDeModulo(modulo.codigo)}
                  </Avatar>
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={modulo.nombre}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: rutaActiva(pathname, modulo.ruta) ? 750 : 550,
                          fontSize: 14,
                        },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))
        )}
      </List>

      {!collapsed && (
        <Box sx={{ px: 2.5, py: 2, color: "text.secondary" }}>
          <Typography variant="caption" sx={{ display: "block" }}>
            Plataforma Institucional
          </Typography>
          <Typography variant="caption">v1.0.0</Typography>
        </Box>
      )}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          height: headerHeight,
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (value) => value.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: `${headerHeight}px !important`, gap: 2 }}>
          <IconButton
            onClick={() =>
              mobile ? setMobileOpen(true) : setCollapsed((value) => !value)
            }
            sx={{ bgcolor: "#e1f1f7", borderRadius: 2, width: 44, height: 44 }}
            aria-label="Alternar menú"
          >
            {mobile ? (
              <MenuRounded />
            ) : collapsed ? (
              <ChevronRight />
            ) : (
              <ChevronLeft />
            )}
          </IconButton>
          <Avatar
            variant="rounded"
            sx={{
              display: { xs: "none", md: "flex" },
              bgcolor: "#b48b28",
              color: "white",
              fontWeight: 800,
            }}
          >
            LP
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ fontWeight: 800, lineHeight: 1.25, fontSize: { xs: 14, md: "inherit" } }}
            >
              <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                Plataforma Institucional -{" "}
              </Box>
              GADLP
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          {!mobile && (
            <Box sx={{ minWidth: 0, textAlign: "right" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {sesion.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {sesion.rolesTexto}
              </Typography>
            </Box>
          )}
          {mobile && (
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
              {sesion.iniciales}
            </Avatar>
          )}
          <Box component="form" action={cerrarSesionAction}>
            <Tooltip title="Cerrar sesión">
              <IconButton type="submit" aria-label="Cerrar sesión">
                <LogoutOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {mobile ? (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: expandedWidth,
              pt: `${headerHeight}px`,
            },
          }}
        >
          {navigation}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              pt: `${headerHeight}px`,
              overflowX: "hidden",
              transition: theme.transitions.create("width"),
              borderRightColor: "divider",
            },
          }}
        >
          {navigation}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: `${drawerWidth}px` },
          pt: `${headerHeight}px`,
          minHeight: "100vh",
          transition: theme.transitions.create("margin-left"),
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1440, mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
