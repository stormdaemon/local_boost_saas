import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { publicError } from "@/lib/labels";
import { logError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonyme";
  if (!rateLimit(`contact:${ip}`, 3, 300_000)) {
    return NextResponse.json({ error: publicError("ratelimit") }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    await logError("contact", e);
    return NextResponse.json({ error: publicError("service") }, { status: 500 });
  }
}
