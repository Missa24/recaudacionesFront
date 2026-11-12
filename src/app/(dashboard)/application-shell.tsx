"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeRounded from "@mui/icons-material/HomeRounded";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import MenuRounded from "@mui/icons-material/MenuRounded";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
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
import type { SecurityNavigationSystem } from "@/services/seguridad.service";
import type { UserProfile } from "@/services/user-profile.service";
import { UserProfileProvider } from "@/common/context/UserProfileContext";
import { logoutAction } from "../login/actions";

const expandedWidth = 272;
const collapsedWidth = 76;
const headerHeight = 72;

export function ApplicationShell({
  systems,
  profile,
  children,
}: {
  systems: SecurityNavigationSystem[];
  profile: UserProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSystems, setOpenSystems] = useState<Set<string>>(
    () =>
      new Set(
        systems
          .filter((system) =>
            system.modules.some((module) => module.ruta === pathname),
          )
          .map((system) => system.id),
      ),
  );
  const drawerWidth = collapsed ? collapsedWidth : expandedWidth;

  const toggleSystem = (systemId: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenSystems(new Set([systemId]));
      return;
    }
    setOpenSystems((current) => {
      const next = new Set(current);
      if (next.has(systemId)) next.delete(systemId);
      else next.add(systemId);
      return next;
    });
  };

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
        {systems.map((system) => {
          const open = openSystems.has(system.id);
          const active = system.modules.some(
            (module) => module.ruta === pathname,
          );
          return (
            <Box key={system.id} sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? system.nombre : ""} placement="right">
                <ListItemButton
                  selected={active}
                  onClick={() => toggleSystem(system.id)}
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
                      <SettingsOutlined fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={system.nombre}
                      slotProps={{ primary: { sx: { fontWeight: 750 } } }}
                    />
                  )}
                  {!collapsed &&
                    (open ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    ))}
                </ListItemButton>
              </Tooltip>
              {!collapsed && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <List
                    disablePadding
                    sx={{
                      ml: 2.25,
                      pl: 1,
                      borderLeft: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {system.modules.map((module) => (
                      <ListItemButton
                        key={module.id}
                        component={module.ruta ? Link : "div"}
                        href={module.ruta || undefined}
                        disabled={!module.ruta}
                        selected={module.ruta === pathname}
                        onClick={() => setMobileOpen(false)}
                        sx={{
                          borderRadius: 2,
                          minHeight: 44,
                          mb: 0.25,
                          pl: 2.25,
                          pr: 1.25,
                        }}
                      >
                        <ListItemText
                          primary={module.nombre}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: 14,
                                fontWeight:
                                  module.ruta === pathname ? 700 : 500,
                              },
                            },
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
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
    <UserProfileProvider profile={profile}>
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
                Plataforma Institucional - {" "}
              </Box>
              GADLP
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
              Sistemas y módulos institucionales
            </Typography> */}
          </Box>
          <Box sx={{ flex: 1 }} />
          {!mobile && (
            <Box sx={{ minWidth: 0, textAlign: "right" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {profile.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {profile?.rrhh?.cargo ?? profile?.rrhh?.puesto ?? profile.username}
              </Typography>
            </Box>
          )}
          <Box component="form" action={logoutAction}>
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
    </UserProfileProvider>
  );
}
