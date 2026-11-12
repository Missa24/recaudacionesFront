import { createTheme } from "@mui/material/styles";
import {
  brand,
  elevation,
  feedback,
  shape,
  surfaces,
  text,
} from "./tokens";

/**
 * Tema único del sistema. Los valores salen de `tokens.ts` para que no haya
 * hexadecimales sueltos por los componentes.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brand.primary,
      dark: brand.primaryDark,
      light: brand.primaryLight,
      contrastText: brand.primaryContrast,
    },
    secondary: {
      main: brand.accent,
      dark: brand.accentDark,
      light: brand.accentLight,
    },
    success: { main: feedback.success, light: feedback.successLight },
    warning: { main: feedback.warning, light: feedback.warningLight },
    error: { main: feedback.error, light: feedback.errorLight },
    info: { main: feedback.info, light: feedback.infoLight },
    text: { primary: text.primary, secondary: text.secondary },
    divider: surfaces.border,
    background: { default: surfaces.page, paper: surfaces.paper },
  },
  shape: { borderRadius: shape.radius },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { variant: "outlined" } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          borderColor: surfaces.border,
          boxShadow: elevation.card,
        },
      },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: surfaces.muted,
          color: text.primary,
        },
      },
    },
    MuiChip: { defaultProps: { size: "small" } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: shape.radiusLg },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: shape.radiusSm },
      },
    },
  },
});
