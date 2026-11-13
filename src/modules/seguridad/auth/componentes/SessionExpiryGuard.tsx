"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/common/components/ToastProvider";
import { cerrarSesionAction } from "../acciones";

/**
 * Módulo: Seguridad / Autenticación
 * Archivo: SessionExpiryGuard.tsx
 *
 * Controla la expiración de la sesión en el navegador:
 * - avisa dos minutos antes del vencimiento del JWT,
 * - cierra la sesión y redirige al login cuando expira,
 * - recalcula permisos cada cinco minutos y al volver a la pestaña.
 *
 * El servidor sigue siendo la autoridad: aunque el temporizador falle,
 * cada petición valida la cookie y el token.
 */
export function SessionExpiryGuard({ expiraEn }: { expiraEn: string }) {
  const router = useRouter();
  const toast = useToast();
  const toastRef = useRef(toast);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    const expiracion = new Date(expiraEn).getTime();
    if (!Number.isFinite(expiracion)) return;

    const temporizadores: number[] = [];
    const aviso = expiracion - Date.now() - 2 * 60 * 1000;

    if (aviso > 0) {
      temporizadores.push(
        window.setTimeout(() => {
          toastRef.current.warning(
            "Tu sesión expirará en 2 minutos. Guarda tu trabajo.",
          );
        }, aviso),
      );
    }

    temporizadores.push(
      window.setTimeout(
        () => {
          void cerrarSesionAction().catch(() => {
            window.location.replace("/login?motivo=sesion");
          });
        },
        Math.max(0, expiracion - Date.now()),
      ),
    );

    return () => {
      for (const id of temporizadores) window.clearTimeout(id);
    };
  }, [expiraEn]);

  useEffect(() => {
    let activo = true;

    const refrescar = async () => {
      try {
        const respuesta = await fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
        });
        if (respuesta.status === 401) {
          window.location.replace("/login?motivo=sesion");
          return;
        }
        if (respuesta.ok && activo) router.refresh();
      } catch {
        // Un fallo de red no cierra la sesión: se reintenta en el próximo ciclo.
      }
    };

    const intervalo = window.setInterval(refrescar, 5 * 60 * 1000);
    const alVolver = () => {
      if (document.visibilityState === "visible") void refrescar();
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      activo = false;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [router]);

  return null;
}
