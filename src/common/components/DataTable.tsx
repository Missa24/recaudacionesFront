"use client";

import { ReactNode, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import type { PaginationMeta } from "@/types/types";

interface Props<T extends GridValidRowModel & { id: string }> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;

  /**
   * Modo de paginación.
   *  - "server": requiere `meta`, `onPaginationChange`. La página decide qué pedir.
   *  - "client": MUI pagina los `rows` localmente. No se usa `meta`.
   */
  paginationMode?: "server" | "client";

  /** Sólo en modo "server". */
  meta?: PaginationMeta;
  onPaginationChange?: (model: GridPaginationModel) => void;
  onSortChange?: (model: GridSortModel) => void;

  search?: string;
  onSearchChange?: (value: string) => void;
  hideSearch?: boolean;
  searchPlaceholder?: string;
  toolbarLayout?: "inline" | "stacked";

  onCreate?: () => void;
  createLabel?: string;
  extraToolbar?: ReactNode;

  minHeight?: number;
  hideLinearProgress?: boolean;
  density?: "compact" | "standard" | "comfortable";
  disableRowSelectionOnClick?: boolean;
}

/**
 * Tabla estándar del sistema (server-side o client-side).
 *
 * - Modo server: ideal para listados grandes con filtros/paginación desde API.
 * - Modo client: ideal para colecciones chicas que ya vienen completas
 *   (aprobaciones de una solicitud, catálogos, bitácora sin filtros server).
 *
 * Ejemplo server:
 * ```tsx
 * <DataTable
 *   rows={crud.rows}
 *   columns={cols}
 *   meta={crud.meta}
 *   onPaginationChange={(m) => crud.setParams({ page: m.page + 1, limit: m.pageSize })}
 *   onCreate={openCreate}
 * />
 * ```
 *
 * Ejemplo client:
 * ```tsx
 * <DataTable
 *   rows={allRows}
 *   columns={cols}
 *   paginationMode="client"
 *   hideSearch
 * />
 * ```
 */
export function DataTable<T extends GridValidRowModel & { id: string }>({
  rows,
  columns,
  loading = false,
  paginationMode = "server",
  meta,
  onPaginationChange,
  onSortChange,
  search = "",
  onSearchChange,
  hideSearch = false,
  searchPlaceholder = "Buscar…",
  toolbarLayout = "inline",
  onCreate,
  createLabel = "Nuevo",
  extraToolbar,
  minHeight = 400,
  hideLinearProgress = false,
  density = "standard",
  disableRowSelectionOnClick = true,
}: Props<T>) {
  const isServer = paginationMode === "server";

  // Sólo en modo server construimos el modelo controlado.
  const serverProps = useMemo(() => {
    if (!isServer || !meta) return {};
    return {
      rowCount: meta.total,
      paginationModel: {
        page: Math.max(0, meta.page - 1),
        pageSize: meta.limit,
      } as GridPaginationModel,
      onPaginationModelChange: onPaginationChange,
      onSortModelChange: onSortChange,
    };
  }, [isServer, meta, onPaginationChange, onSortChange]);

  const showToolbar = !hideSearch || !!extraToolbar || !!onCreate;
  const searchField = !hideSearch ? (
    <TextField
      value={search}
      onChange={(e) => onSearchChange?.(e.target.value)}
      placeholder={searchPlaceholder}
      sx={{
        width: { xs: "100%", sm: 380 },
        maxWidth: "100%",
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          backgroundColor: "#fff",
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  ) : null;
  const createButton = onCreate ? (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onCreate}
      sx={{
        whiteSpace: "nowrap",
        borderRadius: 2,
        px: 2,
        py: 1,
        fontWeight: 700,
        boxShadow: "none",
        // En pantallas chicas ocupa el ancho completo y nunca se comprime:
        // antes se aplastaba y quedaba en una línea aparte, mal alineado.
        flexShrink: 0,
        width: { xs: "100%", sm: "auto" },
        background: "linear-gradient(135deg, #0f3d4f 0%, #1b5d73 100%)",
        "&:hover": { background: "linear-gradient(135deg, #0d3445 0%, #164d61 100%)" },
      }}
    >
      {createLabel}
    </Button>
  ) : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        borderColor: "divider",
        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
      }}
    >
      {showToolbar ? toolbarLayout === "stacked" ? (
        <Stack sx={{ gap: 1.5, mb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1.5,
            }}
          >
            {searchField}
            {createButton}
          </Stack>
          {extraToolbar ? <Box sx={{ minWidth: 0, width: "100%" }}>{extraToolbar}</Box> : null}
        </Stack>
      ) : (
        <Stack
          direction={{ xs: "column", lg: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", lg: "center" },
            gap: 2,
            mb: 2,
            // Sin `minWidth: 0` los hijos flex no pueden encogerse y la barra
            // desborda el ancho de la tarjeta.
            minWidth: 0,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 auto", lg: "0 1 380px" }, minWidth: 0 }}>
            {searchField ?? <Box />}
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              gap: 1,
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: { xs: "stretch", sm: "flex-end" },
              flexWrap: "wrap",
              minWidth: 0,
              // Los filtros se pueden encoger; el botón de acción no se comprime.
              "& > *": { minWidth: 0 },
            }}
          >
            {extraToolbar}
            {createButton}
          </Stack>
        </Stack>
      ) : null}

      {!hideLinearProgress ? (
        <Box sx={{ height: 4, mb: 1 }}>
          {loading ? <LinearProgress /> : null}
        </Box>
      ) : null}

      <DataGrid<T>
        rows={rows}
        columns={columns}
        loading={loading}
        paginationMode={paginationMode}
        sortingMode={paginationMode}
        pageSizeOptions={[10, 20, 50, 100]}
        density={density}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        autoHeight
        sx={{
          border: "none",
          minHeight,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.72)",
          "& .MuiDataGrid-columnHeaders": {
            borderRadius: 2,
            backgroundColor: "rgba(238, 242, 246, 0.9)",
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
          "& .MuiDataGrid-cell--withRenderer": { overflow: "visible" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(15, 61, 79, 0.02)" },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "rgba(248,250,252,0.8)",
          },
        }}
        {...serverProps}
      />
    </Paper>
  );
}
