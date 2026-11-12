"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useDebounce } from "@/hooks/useDebounce";

export interface RemoteOption {
  id: string;
  label: string;
}

interface Props {
  label: string;
  value: string | null | undefined;
  onChange: (value: string | null, option: RemoteOption | null) => void;
  /** Búsqueda por término (lo que el usuario escribe). */
  loadOptions: (search: string) => Promise<RemoteOption[]>;
  /**
   * Resuelve un id a su opción (label). Se usa cuando `value` está seteado
   * pero ninguna opción cargada coincide — típicamente al editar.
   * Si no se pasa, el combo mostrará el id como fallback.
   */
  loadById?: (id: string) => Promise<RemoteOption | null>;
  /** Permite forzar una opción ya conocida (evita el fetch por id). */
  initialOption?: RemoteOption | null;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

/**
 * Autocomplete con búsqueda remota + resolución de id → label.
 * - Debounce de 350ms en la búsqueda.
 * - Cachea resultados por término y por id.
 * - Si `loadById` está disponible y el `value` no está en `options`,
 *   lo resuelve y lo muestra; nunca deja un UUID a la vista.
 */
export function RemoteAutocomplete({
  label,
  value,
  onChange,
  loadOptions,
  loadById,
  initialOption = null,
  error,
  helperText,
  disabled,
  required,
  placeholder,
}: Props) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 350);

  const [options, setOptions] = useState<RemoteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const searchCache = useRef<Record<string, RemoteOption[]>>({});
  const [byIdCache, setByIdCache] = useState<Record<string, RemoteOption>>({});

  // Opción seleccionada: prioriza initialOption → options → resolvedById.
  const selected = useMemo<RemoteOption | null>(() => {
    if (!value) return null;
    return (
      initialOption?.id === value ? initialOption :
      options.find((o) => o.id === value) ??
      byIdCache[value] ??
      null
    );
  }, [value, options, initialOption, byIdCache]);

  // Carga de opciones según el término de búsqueda (con cache).
  useEffect(() => {
    let alive = true;
    const term = debounced.trim();

    const cached = searchCache.current[term];
    if (cached) {
      queueMicrotask(() => {
        if (alive) setOptions(cached);
      });
      return;
    }

    setLoading(true);
    loadOptions(term)
      .then((opts) => {
        if (!alive) return;
        setOptions(opts);
        searchCache.current[term] = opts;
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Resolución por id cuando no hay opción visible ni initialOption.
  const fetchingRef = useRef<string | null>(null);
  useEffect(() => {
    if (!value) return;
    if (initialOption?.id === value) return;
    if (options.some((o) => o.id === value)) return;
    if (byIdCache[value]) return;
    if (!loadById) return;
    if (fetchingRef.current === value) return;

    fetchingRef.current = value;
    let alive = true;
    loadById(value)
      .then((opt) => {
        if (!alive) return;
        if (opt) {
          setByIdCache((prev) => ({ ...prev, [opt.id]: opt }));
        }
      })
      .finally(() => {
        if (alive) fetchingRef.current = null;
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options, initialOption, byIdCache]);

  // Si el valor seleccionado fue resuelto por id, también lo agregamos a
  // `options` para que el Autocomplete pueda encontrarlo al render.
  const optionsWithSelected = useMemo(() => {
    if (!selected) return options;
    return options.some((o) => o.id === selected.id)
      ? options
      : [selected, ...options];
  }, [options, selected]);

  return (
    <Autocomplete<RemoteOption, false, false, false>
      options={optionsWithSelected}
      value={selected}
      loading={loading}
      disabled={disabled}
      onChange={(_, opt) => onChange(opt?.id ?? null, opt)}
      onInputChange={(_, v) => setInput(v)}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={loading ? "Cargando…" : "Sin resultados"}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          placeholder={placeholder}
          slotProps={{
            ...params.slotProps,
            input: {
              ...(params.slotProps?.input ?? {}),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
