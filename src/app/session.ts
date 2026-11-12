import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateToken } from "@/services/seguridad.service";
import {
  buildUserProfile,
  signUserProfile,
  verifyUserProfile,
  type UserProfile,
} from "@/services/user-profile.service";

const cookieName = process.env.AUTH_COOKIE_NAME ?? "platform_session";
const profileCookieName = `${cookieName}_profile`;

function cookieOptions(expires: Date) {
  return {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSession(
  token: string,
  identity: { username: string; name: string },
  expiresAt: Date,
): Promise<UserProfile> {
  const profile = await buildUserProfile(identity, token);
  const signedProfile = await signUserProfile(profile, token, expiresAt);
  const cookieStore = await cookies();
  const options = cookieOptions(expiresAt);
  cookieStore.set(cookieName, token, options);
  cookieStore.set(profileCookieName, signedProfile, options);
  return profile;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
  cookieStore.delete(profileCookieName);
}

export async function getSession(): Promise<string | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  return (await validateToken(token)) === "ok" ? token : null;
}

export async function requireSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) redirect("/login");
  const status = await validateToken(token);
  if (status !== "ok")
    redirect(status === "invalid" ? "/login" : "/login?error=servicio");
  return token;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const signedProfile = cookieStore.get(profileCookieName)?.value;
  if (!token || !signedProfile) return null;
  return verifyUserProfile(signedProfile, token);
}

export async function requireUserProfile(): Promise<UserProfile> {
  const profile = await getUserProfile();
  if (!profile) redirect("/login");
  return profile;
}
