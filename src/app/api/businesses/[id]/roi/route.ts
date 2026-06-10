import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfileApi } from "@/lib/auth";
import { getOwnedBusiness } from "@/lib/ownership";
import { publicError } from "@/lib/labels";

export const dynamic = "force-dynamic";

async function guard(id: string) {
  const profile = await requireProfileApi();
  if (!profile) {
    return {
      error: NextResponse.json({ error: publicError("auth") }, { status: 401 }),
    };
  }
  const owned = await getOwnedBusiness(id, profile);
  if (!owned.ok) {
    return {
      error: NextResponse.json(
        { error: publicError(owned.reason) },
        { status: owned.reason === "notfound" ? 404 : 403 },
      ),
    };
  }
  return { profile, business: owned.business };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;

  const scenarios = await prisma.roiScenario.findMany({
    where: { businessId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    scenarios.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })),
  );
}

const Body = z.object({
  name: z.string().trim().min(1).max(80).default("Scénario"),
  monthlyInvestment: z.coerce.number().min(0).max(100_000),
  extraVisitors: z.coerce.number().min(0).max(1_000_000),
  conversionRate: z.coerce.number().min(0).max(100),
  closeRate: z.coerce.number().min(0).max(100),
  avgTicket: z.coerce.number().min(0).max(1_000_000),
  marginRate: z.coerce.number().min(0).max(100),
  purchasesPerYear: z.coerce.number().min(0.1).max(365),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }

  const scenario = await prisma.roiScenario.create({
    data: { businessId: id, ...parsed.data },
  });
  return NextResponse.json(
    { ...scenario, createdAt: scenario.createdAt.toISOString() },
    { status: 201 },
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;

  const scenarioId = req.nextUrl.searchParams.get("scenarioId");
  if (!scenarioId) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }
  try {
    await prisma.roiScenario.delete({
      where: { id: scenarioId, businessId: id },
    });
  } catch {
    return NextResponse.json({ error: publicError("notfound") }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
