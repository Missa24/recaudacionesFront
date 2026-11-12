"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, ListParams, PaginationMeta } from "@/types/types";
import { useToast } from "@/common/components/ToastProvider";

interface CrudApi<T, TInput> {
  list: (params?: ListParams) => Promise<{ data: T[]; meta: PaginationMeta }>;
  create: (body: TInput) => Promise<T>;
  update: (id: string, body: Partial<TInput>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface UseCrudOptions<T, TInput> {
  resourceName: string;      // Para mensajes ("Categoría creada")
  api: CrudApi<T, TInput>;
  initialParams?: ListParams;
  autoLoad?: boolean;
}

/**
 * Hook genérico de CRUD: maneja listado, paginación, búsqueda,
 * loading, errores y toasts. Reutilizable en cualquier módulo.
 */
export function useCrud<T extends { id: string }, TInput>({
  resourceName,
  api,
  initialParams,
  autoLoad = true,
}: UseCrudOptions<T, TInput>) {
  const toast = useToast();

  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1, limit: 10, total: 0, totalPages: 0,
    hasNextPage: false, hasPreviousPage: false,
  });
  const [params, setParams] = useState<ListParams>({
    page: 1, limit: 10, order: "ASC", ...initialParams,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** Carga el listado con los filtros actuales. */
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list(params);
      setRows(res.data);
      setMeta(res.meta);
    } catch (e) {
      const err = e as ApiError;
      toast.error(`No se pudo cargar ${resourceName}`, err.message);
    } finally {
      setLoading(false);
    }
  }, [api, params, resourceName, toast]);

  useEffect(() => {
    if (autoLoad) void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const create = useCallback(async (body: TInput) => {
    setSaving(true);
    try {
      const created = await api.create(body);
      toast.success(`${resourceName} creada correctamente`);
      await reload();
      return created;
    } catch (e) {
      const err = e as ApiError;
      toast.error(`Error al crear ${resourceName}`, err.errors?.join(" · ") ?? err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [api, reload, resourceName, toast]);

  const update = useCallback(async (id: string, body: Partial<TInput>) => {
    setSaving(true);
    try {
      const updated = await api.update(id, body);
      toast.success(`${resourceName} actualizada correctamente`);
      await reload();
      return updated;
    } catch (e) {
      const err = e as ApiError;
      toast.error(`Error al actualizar ${resourceName}`, err.errors?.join(" · ") ?? err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [api, reload, resourceName, toast]);

  const remove = useCallback(async (id: string) => {
    setDeleting(true);
    try {
      await api.remove(id);
      toast.success(`${resourceName} eliminada correctamente`);
      await reload();
    } catch (e) {
      const err = e as ApiError;
      toast.error(`Error al eliminar ${resourceName}`, err.message);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [api, reload, resourceName, toast]);

  return {
    rows, meta, params,
    setParams: (patch: Partial<ListParams>) =>
      setParams((p) => ({ ...p, ...patch, page: patch.page ?? 1 })),
    loading, saving, deleting,
    reload, create, update, remove,
  };
}