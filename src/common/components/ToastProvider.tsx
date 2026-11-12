"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, AlertColor, Snackbar } from "@mui/material";

interface Toast {
  id: number;
  message: string;
  description?: string;
  severity: AlertColor;
}

interface ToastContextValue {
  success: (msg: string, description?: string) => void;
  error: (msg: string, description?: string) => void;
  info: (msg: string, description?: string) => void;
  warning: (msg: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Proveedor global de toasts (MUI Snackbar + Alert). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...t, id: Date.now() + Math.random() }]);
  }, []);

  const close = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const value = useMemo<ToastContextValue>(() => ({
    success: (m, d) => push({ message: m, description: d, severity: "success" }),
    error:   (m, d) => push({ message: m, description: d, severity: "error" }),
    info:    (m, d) => push({ message: m, description: d, severity: "info" }),
    warning: (m, d) => push({ message: m, description: d, severity: "warning" }),
  }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((t) => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={4500}
          onClose={() => close(t.id)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={t.severity}
            variant="filled"
            onClose={() => close(t.id)}
            sx={{ width: "100%", maxWidth: 420 }}
          >
            <strong>{t.message}</strong>
            {t.description ? <div style={{ marginTop: 4 }}>{t.description}</div> : null}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}