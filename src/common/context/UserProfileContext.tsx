"use client";

import { createContext, useContext } from "react";
import type { UserProfile } from "@/services/user-profile.service";

const UserProfileContext = createContext<UserProfile | null>(null);

export function UserProfileProvider({
  profile,
  children,
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  return (
    <UserProfileContext.Provider value={profile}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const profile = useContext(UserProfileContext);
  if (!profile) {
    throw new Error("useUserProfile debe usarse dentro de UserProfileProvider");
  }
  return profile;
}