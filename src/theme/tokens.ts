/**
 * Tokens de diseño del sistema de viáticos.
 *
 * Todo el color, el radio y la sombra del módulo sale de acá: antes había
 * gradientes y códigos hexadecimales repetidos dentro de `DataTable`, del shell
 * y de varias páginas, así que un cambio de identidad obligaba a buscarlos uno
 * por uno.
 */

export const brand = {
  primary: "#164E6B",
  primaryDark: "#0F3A51",
  primaryLight: "#E1F1F7",
  primaryContrast: "#FFFFFF",
  accent: "#B48B28",
  accentDark: "#8E6C1C",
  accentLight: "#FBF3DF",
} as const;

export const surfaces = {
  page: "#F6F8F7",
  paper: "#FFFFFF",
  muted: "#F2F5F6",
  border: "#D8E0E4",
  borderStrong: "#B9C7CD",
} as const;

export const text = {
  primary: "#1C2B33",
  secondary: "#5A6B73",
  disabled: "#95A3A9",
  inverse: "#FFFFFF",
} as const;

export const feedback = {
  success: "#1E7A46",
  successLight: "#E6F4EC",
  warning: "#B26A00",
  warningLight: "#FDF2E2",
  error: "#B3261E",
  errorLight: "#FBEAE8",
  info: "#164E6B",
  infoLight: "#E1F1F7",
} as const;

export const gradients = {
  brand: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
  accent: `linear-gradient(135deg, ${brand.accent} 0%, ${brand.accentDark} 100%)`,
  soft: `linear-gradient(180deg, ${surfaces.paper} 0%, ${surfaces.muted} 100%)`,
} as const;

export const shape = {
  radius: 10,
  radiusSm: 6,
  radiusLg: 16,
} as const;

export const elevation = {
  card: "0 1px 2px rgba(16, 42, 56, 0.06), 0 4px 12px rgba(16, 42, 56, 0.06)",
  raised: "0 6px 20px rgba(16, 42, 56, 0.12)",
} as const;

/** Colores de los estados de solicitud y de liquidación. */
const COLORES_ESTADO: Record<
  string,
  { color: string; background: string; label: string }
> = {
  BORRADOR: {
    color: text.secondary,
    background: surfaces.muted,
    label: "Borrador",
  },
  EN_REVISION_JEFE: {
    color: feedback.info,
    background: feedback.infoLight,
    label: "En revisión del jefe",
  },
  OBSERVADO_JEFE: {
    color: feedback.warning,
    background: feedback.warningLight,
    label: "Observado por el jefe",
  },
  EN_AUTORIZACION: {
    color: feedback.info,
    background: feedback.infoLight,
    label: "En autorización",
  },
  AUTORIZADO: {
    color: feedback.success,
    background: feedback.successLight,
    label: "Autorizado",
  },
  RECHAZADO: {
    color: feedback.error,
    background: feedback.errorLight,
    label: "Rechazado",
  },
  EN_GESTION_FINANCIERA: {
    color: feedback.info,
    background: feedback.infoLight,
    label: "En gestión financiera",
  },
  EN_EJECUCION: {
    color: feedback.info,
    background: feedback.infoLight,
    label: "En ejecución",
  },
  PENDIENTE: {
    color: text.secondary,
    background: surfaces.muted,
    label: "Pendiente",
  },
  EN_REVISION: {
    color: feedback.info,
    background: feedback.infoLight,
    label: "En revisión",
  },
  OBSERVADO: {
    color: feedback.warning,
    background: feedback.warningLight,
    label: "Observado",
  },
  LIQUIDADO: {
    color: feedback.success,
    background: feedback.successLight,
    label: "Liquidado",
  },
  CERRADO: {
    color: brand.primary,
    background: brand.primaryLight,
    label: "Cerrado",
  },
  EMITIDO: {
    color: feedback.success,
    background: feedback.successLight,
    label: "Emitido",
  },
  ANULADO: {
    color: feedback.error,
    background: feedback.errorLight,
    label: "Anulado",
  },
  ACTIVO: {
    color: feedback.success,
    background: feedback.successLight,
    label: "Activo",
  },
  INACTIVO: {
    color: text.secondary,
    background: surfaces.muted,
    label: "Inactivo",
  },
};

const ESTADO_DESCONOCIDO = {
  color: text.secondary,
  background: surfaces.muted,
  label: "",
};

/** Color, fondo y etiqueta legible de un estado. */
export function estadoEstilo(estado?: string | null) {
  const clave = (estado ?? "").trim().toUpperCase();
  const encontrado = COLORES_ESTADO[clave];
  if (encontrado) return encontrado;
  return { ...ESTADO_DESCONOCIDO, label: clave || "—" };
}

/** Etiquetas legibles de los tres ámbitos de solicitud. */
export const ETIQUETA_AMBITO: Record<string, string> = {
  INTRADEPARTAMENTAL: "Intradepartamental",
  INTERDEPARTAMENTAL: "Interdepartamental",
  EXTERIOR: "Al exterior",
};
