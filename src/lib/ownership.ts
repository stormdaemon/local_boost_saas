import "server-only";
import { prisma } from "./prisma";
import type { Business, Profile } from "@/generated/prisma/client";

export type OwnershipResult =
  | { ok: true; business: Business }
  | { ok: false; reason: "notfound" | "forbidden" };

/** Charge un prospect en vérifiant qu'il appartient à l'utilisateur (ou admin). */
export async function getOwnedBusiness(
  id: string,
  profile: Profile,
): Promise<OwnershipResult> {
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) return { ok: false, reason: "notfound" };
  if (business.userId !== profile.id && profile.role !== "ADMIN") {
    return { ok: false, reason: "forbidden" };
  }
  return { ok: true, business };
}
