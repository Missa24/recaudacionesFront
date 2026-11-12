"use server";

import { authenticate } from "@/services/seguridad.service";
import { clearSession, createSession } from "../session";

export async function loginAction(username: string, password: string) {
  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password) {
    return { success: false as const, message: "Completa los campos obligatorios." };
  }

  const result = await authenticate(normalizedUsername, password);
  if (result.status === "invalid") {
    return { success: false as const, message: "Credenciales inválidas." };
  }
  if (result.status === "unavailable") {
    return {
      success: false as const,
      message: "No se pudo conectar con el servicio de autenticación.",
    };
  }

  const profile = await createSession(result.token, result.user, result.expiresAt);
  return {
    success: true as const,
    user: {
      id: result.user.username,
      username: result.user.username,
      email: result.user.email ?? "",
      nombre_completo: profile.fullName,
    },
    accessToken: result.token,
  };
}

export async function logoutAction(): Promise<void> {
  await clearSession();
}
