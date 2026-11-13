/* eslint-disable react-hooks/set-state-in-effect -- El listado se recarga al cambiar filtros o página; el estado de carga se actualiza al iniciar la consulta. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type {
  Paginacion,
  ParametrosListado,
  ResultadoListado,
} from "../tipos";

/**
 * Módulo: Seguridad / Común
 * Archivo: useListadoSeguridad.ts
 *
 * Hook de listados paginados para las tablas del módulo. Encapsula
 * búsqueda con retardo, paginación, orden y recarga, y consume Server
 * Actions que ya validaron la sesión en el servidor.
 */
export function useListadoSeguridad<T extends { id: string }>(
  cargar: (parametros: ParametrosListado) => Promise<ResultadoListado<T>>,
  opciones: {
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  } = {},
) {
  const limiteInicial = opciones.limit ?? 10;
  const ordenInicial: Pick<ParametrosListado, "sortBy" | "sortOrder"> = {
    sortBy: opciones.sortBy,
    sortOrder: opciones.sortOrder ?? "ASC",
  };

  const [parametros, setParametros] = useState<ParametrosListado>({
    page: 1,
    limit: limiteInicial,
    ...ordenInicial,
  });
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDebounce(busqueda, 400);

  const [filas, setFilas] = useState<T[]>([]);
  const [paginacion, setPaginacion] = useState<Paginacion>({
    total: 0,
    page: 1,
    limit: limiteInicial,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // La búsqueda se aplica con retardo y siempre vuelve a la primera página.
  useEffect(() => {
    const texto = busquedaDiferida.trim() || undefined;
    setParametros((previos) =>
      previos.search === texto ? previos : { ...previos, search: texto, page: 1 },
    );
  }, [busquedaDiferida]);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    cargar(parametros)
      .then((resultado) => {
        if (!vigente) return;
        if (resultado.ok) {
          setFilas(resultado.pagina.items);
          setPaginacion(resultado.pagina.pagination);
        } else {
          setFilas([]);
          setError(resultado.mensaje);
        }
      })
      .catch(() => {
        if (!vigente) return;
        setFilas([]);
        setError("No se pudo cargar la información.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [cargar, parametros, version]);

  /** Fuerza una nueva consulta con los parámetros actuales. */
  const recargar = useCallback(() => setVersion((valor) => valor + 1), []);

  /** Adaptador para `onPaginationChange` de MUI DataGrid (página 0-based). */
  const cambiarPagina = useCallback(
    (modelo: { page: number; pageSize: number }) => {
      setParametros((previos) => ({
        ...previos,
        page: modelo.page + 1,
        limit: modelo.pageSize,
      }));
    },
    [],
  );

  /** Adaptador para `onSortChange`; sin orden explícito vuelve al inicial. */
  const cambiarOrden = useCallback(
    (campo: string | undefined, direccion: "ASC" | "DESC" | undefined) => {
      setParametros((previos) => ({
        ...previos,
        page: 1,
        sortBy: campo ?? ordenInicial.sortBy,
        sortOrder: campo ? (direccion ?? "ASC") : ordenInicial.sortOrder,
      }));
    },
    [ordenInicial.sortBy, ordenInicial.sortOrder],
  );

  /** Aplica un filtro adicional (por ejemplo `status`) y reinicia la página. */
  const actualizarFiltro = useCallback(
    (clave: string, valor: string | undefined) => {
      setParametros((previos) => ({
        ...previos,
        page: 1,
        [clave]: valor || undefined,
      }));
    },
    [],
  );

  return {
    filas,
    paginacion,
    cargando,
    error,
    busqueda,
    setBusqueda,
    parametros,
    cambiarPagina,
    cambiarOrden,
    actualizarFiltro,
    recargar,
  };
}
