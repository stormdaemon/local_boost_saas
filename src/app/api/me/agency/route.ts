import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireProfileApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEntitlements } from "@/lib/entitlements";
import { publicError } from "@/lib/labels";

export const dynamic = "force-dynamic";

const Body = z.object({
  agencyName: z.string().trim().max(80).optional().or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || v.startsWith("https://") || v.startsWith("http://"), {
      message: "URL invalide",
    })
    .optional()
    .or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  signature: z.string().trim().max(400).optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }

  const ent = await getEntitlements(profile.id);
  if (profile.role !== "ADMIN" && !ent.features?.whiteLabel) {
    return NextResponse.json(
      {
        error:
          "La personnalisation en marque blanche est incluse dans les forfaits Agence et Pro.",
      },
      { status: 403 },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }

  const v = parsed.data;
  const toNull = (s?: string) => (s && s.length > 0 ? s : null);

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      agencyName: toNull(v.agencyName),
      logoUrl: toNull(v.logoUrl),
      primaryColor: toNull(v.primaryColor),
      website: toNull(v.website),
      contactEmail: toNull(v.contactEmail),
      phone: toNull(v.phone),
      signature: toNull(v.signature),
    },
  });

  return NextResponse.json({ ok: true });
}
