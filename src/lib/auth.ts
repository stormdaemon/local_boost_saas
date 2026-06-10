import "server-only";
import { createSupabaseServer } from "./supabase/server";
import { prisma } from "./prisma";
import type { Profile } from "@/generated/prisma/client";

/**
 * Bootstrap d'administration : ces adresses obtiennent automatiquement le
 * rôle ADMIN à la connexion. Compte temporaire de lancement — à retirer
 * ou remplacer une fois l'équipe en place.
 */
const BOOTSTRAP_ADMIN_EMAILS = ["tlafont49@gmail.com"];

export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return { id: user.id, email: user.email };
}

export async function ensureProfile(user: {
  id: string;
  email: string;
}): Promise<Profile> {
  const isBootstrapAdmin = BOOTSTRAP_ADMIN_EMAILS.includes(
    user.email.toLowerCase(),
  );
  return prisma.profile.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      ...(isBootstrapAdmin ? { role: "ADMIN" as const } : {}),
    },
    create: {
      id: user.id,
      email: user.email,
      role: isBootstrapAdmin ? "ADMIN" : "USER",
    },
  });
}

/** Pour les Server Components : profil courant ou null. */
export async function getProfile(): Promise<Profile | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return ensureProfile(user);
}

/** Pour les routes API : profil courant ou null (l'appelant renvoie 401). */
export async function requireProfileApi(): Promise<Profile | null> {
  return getProfile();
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "ADMIN";
}
