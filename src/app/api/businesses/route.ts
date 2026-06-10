import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfileApi } from "@/lib/auth";
import { publicError } from "@/lib/labels";
import { logError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  const businesses = await prisma.business.findMany({
    where: { userId: profile.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      sector: true,
      city: true,
      contactName: true,
      status: true,
      potentialValue: true,
      followUpDate: true,
      notes: true,
      createdAt: true,
      assets: {
        where: { type: "AUDIT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
  return NextResponse.json(
    businesses.map((b) => ({
      ...b,
      hasAudit: b.assets.length > 0,
      assets: undefined,
    })),
  );
}

const CreateBody = z.object({
  name: z.string().trim().min(1).max(120),
  sector: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  mainGoal: z.string().trim().min(1).max(120),
  website: z.string().trim().max(300).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  targetAudience: z.string().trim().max(200).optional().default(""),
  contactName: z.string().trim().max(120).optional().default(""),
  hasGoogleBusiness: z.boolean().optional().default(false),
  socialNetworks: z.array(z.string().trim().max(40)).max(10).optional().default([]),
  monthlyBudget: z.coerce.number().min(0).max(50_000).optional().default(500),
  potentialValue: z.coerce.number().min(0).max(10_000_000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }
  const v = parsed.data;

  try {
    const business = await prisma.business.create({
      data: {
        userId: profile.id,
        name: v.name,
        sector: v.sector,
        city: v.city,
        mainGoal: v.mainGoal,
        website: v.website || null,
        phone: v.phone || null,
        description: v.description || null,
        targetAudience: v.targetAudience || null,
        contactName: v.contactName || null,
        hasGoogleBusiness: v.hasGoogleBusiness,
        socialNetworks: v.socialNetworks,
        monthlyBudget: Math.round(v.monthlyBudget),
        potentialValue: v.potentialValue ?? null,
        status: "NOUVEAU",
      },
    });
    return NextResponse.json(business, { status: 201 });
  } catch (e) {
    await logError("businesses.create", e);
    return NextResponse.json({ error: publicError("service") }, { status: 500 });
  }
}
