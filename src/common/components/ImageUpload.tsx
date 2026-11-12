"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { surfaces } from "@/theme/tokens";
import { formatearBytes } from "@/common/lib/formatBytes";

/** 1 MB, el mismo tope que valida el backend. */
export const MAX_BYTES_IMAGEN = 1024 * 1024;
export const TIPOS_IMAGEN = ["image/png", "image/jpeg", "image/webp"];

interface ImageUploadProps {
  archivos: File[];
  onChange: (archivos: File[]) => void;
  maxBytes?: number;
  maxArchivos?: number;
  disabled?: boolean;
  ayuda?: string;
}

/**
 * Selector de imágenes **opcional**.
 *
 * Valida en el navegador antes de subir (tipo y peso) para no hacer viajar un
 * archivo que el backend va a rechazar; la validación de verdad la hace igual
 * el servidor sobre el contenido.
 */
export function ImageUpload({
  archivos,
  onChange,
  maxBytes = MAX_BYTES_IMAGEN,
  maxArchivos = 5,
  disabled = false,
  ayuda,
}: ImageUploadProps) {
  const [errores, setErrores] = useState<string[]>([]);

  const previsualizaciones = useMemo(
    () => archivos.map((archivo) => URL.createObjectURL(archivo)),
    [archivos],
  );

  useEffect(() => {
    return () => {
      previsualizaciones.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previsualizaciones]);

  const seleccionar = (evento: ChangeEvent<HTMLInputElement>) => {
    const seleccionados = Array.from(evento.target.files ?? []);
    evento.target.value = "";

    const problemas: string[] = [];
    const aceptados: File[] = [];

    for (const archivo of seleccionados) {
      if (!TIPOS_IMAGEN.includes(archivo.type)) {
        problemas.push(`${archivo.name}: solo se admiten PNG, JPEG o WebP.`);
        continue;
      }
      if (archivo.size > maxBytes) {
        problemas.push(
          `${archivo.name}: pesa ${formatearBytes(archivo.size)} y el máximo es ${formatearBytes(maxBytes)}.`,
        );
        continue;
      }
      aceptados.push(archivo);
    }

    const total = [...archivos, ...aceptados].slice(0, maxArchivos);
    if (archivos.length + aceptados.length > maxArchivos) {
      problemas.push(`Se admiten hasta ${maxArchivos} imágenes por informe.`);
    }

    setErrores(problemas);
    if (aceptados.length > 0) onChange(total);
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button
          component="label"
          size="small"
          variant="outlined"
          disabled={disabled || archivos.length >= maxArchivos}
          startIcon={<AddPhotoAlternateIcon fontSize="small" />}
        >
          Agregar imágenes
          <input
            type="file"
            accept={TIPOS_IMAGEN.join(",")}
            multiple
            hidden
            onChange={seleccionar}
          />
        </Button>
        <Typography variant="caption" color="text.secondary">
          {ayuda ??
            `Opcional · PNG, JPEG o WebP · hasta ${formatearBytes(maxBytes)} cada una · máximo ${maxArchivos}`}
        </Typography>
      </Stack>

      {errores.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {errores.map((error) => (
            <Typography
              key={error}
              variant="caption"
              color="error"
              sx={{ display: "block" }}
            >
              {error}
            </Typography>
          ))}
        </Box>
      )}

      {archivos.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1.5 }}>
          {archivos.map((archivo, indice) => (
            <Box
              key={`${archivo.name}-${indice}`}
              sx={{
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${surfaces.border}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previsualizaciones[indice]}
                alt={archivo.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Tooltip title="Quitar">
                <IconButton
                  size="small"
                  disabled={disabled}
                  onClick={() =>
                    onChange(archivos.filter((_, posicion) => posicion !== indice))
                  }
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    bgcolor: "rgba(255,255,255,0.85)",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export interface ImagenAdjunta {
  id: string;
  nombreOriginal: string;
  pesoBytes: number;
  url: string;
  /**
   * Descarga el archivo para previsualizarlo.
   *
   * Cuando se envía, la miniatura usa el blob en lugar de `url`: así la petición
   * lleva la autenticación y el navegador no la bloquea por origen cruzado.
   */
  cargarArchivo?: () => Promise<Blob>;
}

interface ImagenesAdjuntasProps {
  imagenes: ImagenAdjunta[];
  onEliminar?: (id: string) => void;
  /** Recibe la imagen y la URL ya lista para abrir (blob o directa). */
  onVer?: (imagen: ImagenAdjunta, url: string | null) => void;
  eliminando?: boolean;
}

/**
 * Miniatura de una imagen adjunta.
 *
 * Si la imagen sabe descargarse (`cargarArchivo`), se pide como blob y se usa una
 * URL de objeto; si no, cae a su URL directa. Arranca sin `src` para no disparar
 * una petición que el navegador va a bloquear.
 */
function ImagenAdjuntaCard({
  imagen,
  onEliminar,
  onVer,
  eliminando,
}: {
  imagen: ImagenAdjunta;
  onEliminar?: (id: string) => void;
  onVer?: (imagen: ImagenAdjunta, url: string | null) => void;
  eliminando: boolean;
}) {
  const [url, setUrl] = useState<string | null>(
    imagen.cargarArchivo ? null : imagen.url,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargar = imagen.cargarArchivo;
    if (!cargar) return;

    let activo = true;
    let creada: string | null = null;

    void (async () => {
      try {
        const blob = await cargar();
        if (!activo) return;
        creada = URL.createObjectURL(blob);
        setUrl(creada);
      } catch {
        if (activo) setError(true);
      }
    })();

    return () => {
      activo = false;
      if (creada) URL.revokeObjectURL(creada);
    };
  }, [imagen]);

  return (
    <Box sx={{ width: 120 }}>
      <Box
        sx={{
          position: "relative",
          height: 96,
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${surfaces.border}`,
          bgcolor: surfaces.muted,
          display: "grid",
          placeItems: "center",
        }}
      >
        {url && !error ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={imagen.nombreOriginal}
              onError={() => setError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </>
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1, textAlign: "center" }}
          >
            {error ? "No se pudo cargar" : "Cargando…"}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: "absolute", top: 2, right: 2 }}
        >
          {onVer ? (
            <Tooltip title="Ver">
              <IconButton
                size="small"
                onClick={() => onVer(imagen, url)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.85)",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {onEliminar ? (
            <Tooltip title="Eliminar">
              <span>
                <IconButton
                  size="small"
                  disabled={eliminando}
                  onClick={() => onEliminar(imagen.id)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.85)",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
        </Stack>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        title={imagen.nombreOriginal}
        sx={{ display: "block" }}
      >
        {imagen.nombreOriginal}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {formatearBytes(imagen.pesoBytes)}
      </Typography>
    </Box>
  );
}

/** Galería de las imágenes ya guardadas en el informe. */
export function ImagenesAdjuntas({
  imagenes,
  onEliminar,
  onVer,
  eliminando = false,
}: ImagenesAdjuntasProps) {
  if (imagenes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Este informe no tiene imágenes adjuntas (la carga es opcional).
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
      {imagenes.map((imagen) => (
        <ImagenAdjuntaCard
          key={imagen.id}
          imagen={imagen}
          onEliminar={onEliminar}
          onVer={onVer}
          eliminando={eliminando}
        />
      ))}
    </Stack>
  );
}
