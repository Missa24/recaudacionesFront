"use client";

import { ReactNode, useState } from "react";
import {
  ButtonProps,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadingButton } from "./LoadingButton";
import { useToast } from "./ToastProvider";

export interface AccionExportacion {
  /** Texto del menú: "PDF", "Excel", etc. */
  etiqueta: string;
  onExport: () => Promise<void>;
  icono?: ReactNode;
}

/**
 * Ejecuta una exportación mostrando el estado de carga y avisando el resultado.
 * Centraliza el manejo de errores para que ninguna pantalla lo repita.
 */
function useExportar() {
  const toast = useToast();
  const [exportando, setExportando] = useState(false);

  const ejecutar = async (accion: () => Promise<void>, nombre: string) => {
    setExportando(true);
    try {
      await accion();
      toast.success(`${nombre} generado`);
    } catch (error) {
      toast.error(
        `No se pudo generar el ${nombre.toLowerCase()}`,
        error instanceof Error ? error.message : undefined,
      );
    } finally {
      setExportando(false);
    }
  };

  return { exportando, ejecutar };
}

interface ExportButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /** Nombre del formato, usado en los avisos: "PDF", "Excel". */
  etiqueta: string;
  onExport: () => Promise<void>;
}

/** Botón de exportación de un solo formato. */
export function ExportButton({
  etiqueta,
  onExport,
  startIcon,
  ...resto
}: ExportButtonProps) {
  const { exportando, ejecutar } = useExportar();

  return (
    <LoadingButton
      variant="outlined"
      {...resto}
      loading={exportando}
      startIcon={startIcon ?? <FileDownloadIcon fontSize="small" />}
      onClick={() => void ejecutar(onExport, etiqueta)}
    >
      {etiqueta}
    </LoadingButton>
  );
}

interface ExportMenuButtonProps
  extends Omit<ButtonProps, "onClick" | "children"> {
  etiqueta: string;
  acciones: AccionExportacion[];
}

/** Botón de exportación con varios formatos. */
export function ExportMenuButton({
  etiqueta,
  acciones,
  startIcon,
  ...resto
}: ExportMenuButtonProps) {
  const { exportando, ejecutar } = useExportar();
  const [ancla, setAncla] = useState<HTMLElement | null>(null);

  const cerrar = () => setAncla(null);

  return (
    <>
      <LoadingButton
        variant="outlined"
        {...resto}
        loading={exportando}
        startIcon={startIcon ?? <FileDownloadIcon fontSize="small" />}
        endIcon={<ExpandMoreIcon fontSize="small" />}
        onClick={(evento) => setAncla(evento.currentTarget)}
      >
        {etiqueta}
      </LoadingButton>

      <Menu
        anchorEl={ancla}
        open={Boolean(ancla)}
        onClose={cerrar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {acciones.map((accion, indice) => (
          <MenuItem
            key={accion.etiqueta}
            onClick={() => {
              cerrar();
              void ejecutar(accion.onExport, `${accion.etiqueta}`);
            }}
            divider={indice < acciones.length - 1}
          >
            <ListItemIcon>
              {accion.icono ?? <FileDownloadIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{accion.etiqueta}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
