import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfileApi } from "@/lib/auth";
import { getOwnedBusiness } from "@/lib/ownership";
import { publicError } from "@/lib/labels";
import type { AssetTypeKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  const { id } = await params;
  const owned = await getOwnedBusiness(id, profile);
  if (!owned.ok) {
    return NextResponse.json(
      { error: publicError(owned.reason) },
      { status: owned.reason === "notfound" ? 404 : 403 },
    );
  }

  const [assets, roiScenarios, owner] = await Promise.all([
    prisma.generatedAsset.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.roiScenario.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
    }),
    owned.business.userId
      ? prisma.profile.findUnique({ where: { id: owned.business.userId } })
      : Promise.resolve(null),
  ]);

  const latest: Partial<Record<AssetTypeKey, unknown>> = {};
  for (const a of assets) {
    const t = a.type as AssetTypeKey;
    if (!latest[t]) {
      latest[t] = {
        id: a.id,
        type: a.type,
        data: a.data,
        modelUsed: a.modelUsed,
        createdAt: a.createdAt.toISOString(),
      };
    }
  }

  return NextResponse.json({
    ...owned.business,
    createdAt: owned.business.createdAt.toISOString(),
    followUpDate: owned.business.followUpDate?.toISOString() ?? null,
    assets: latest,
    roiScenarios: roiScenarios.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
    agency: owner
      ? {
          agencyName: owner.agencyName,
          logoUrl: owner.logoUrl,
          primaryColor: owner.primaryColor,
          website: owner.website,
          contactEmail: owner.contactEmail ?? owner.email,
          phone: owner.phone,
          signature: owner.signature,
        }
      : null,
  });
}

const PatchBody = z.object({
  status: z
    .enum([
      "NOUVEAU",
      "AUDIT_GENERE",
      "RDV_PREVU",
      "PROPOSITION_ENVOYEE",
      "GAGNE",
      "PERDU",
    ])
    .optional(),
  contactName: z.string().trim().max(120).nullable().optional(),
  potentialValue: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  followUpDate: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  const { id } = await params;
  const owned = await getOwnedBusiness(id, profile);
  if (!owned.ok) {
    return NextResponse.json(
      { error: publicError(owned.reason) },
      { status: owned.reason === "notfound" ? 404 : 403 },
    );
  }

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }
  const v = parsed.data;

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...(v.status !== undefined ? { status: v.status } : {}),
      ...(v.contactName !== undefined ? { contactName: v.contactName } : {}),
      ...(v.potentialValue !== undefined
        ? { potentialValue: v.potentialValue === null ? null : Math.round(v.potentialValue) }
        : {}),
      ...(v.followUpDate !== undefined
        ? { followUpDate: v.followUpDate ? new Date(v.followUpDate) : null }
        : {}),
      ...(v.notes !== undefined ? { notes: v.notes } : {}),
    },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  const { id } = await params;
  const owned = await getOwnedBusiness(id, profile);
  if (!owned.ok) {
    return NextResponse.json(
      { error: publicError(owned.reason) },
      { status: owned.reason === "notfound" ? 404 : 403 },
    );
  }
  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
