import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireProfileApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscriptionApproval, isPaypalConfigured } from "@/lib/paypal";
import { publicError } from "@/lib/labels";
import { logError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const Body = z.object({ tier: z.enum(["SOLO", "AGENCE", "PRO"]) });

export async function POST(req: NextRequest) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  if (!rateLimit(`checkout:${profile.id}`, 5, 60_000)) {
    return NextResponse.json({ error: publicError("ratelimit") }, { status: 429 });
  }
  if (!isPaypalConfigured()) {
    return NextResponse.json({ error: publicError("payment") }, { status: 503 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      new URL(req.url).origin;
    const { approveUrl, subscriptionId } = await createSubscriptionApproval(
      parsed.data.tier,
      profile.id,
      origin,
    );

    await prisma.subscription.upsert({
      where: { userId: profile.id },
      update: {
        plan: parsed.data.tier,
        status: "PENDING",
        paypalSubscriptionId: subscriptionId,
      },
      create: {
        userId: profile.id,
        plan: parsed.data.tier,
        status: "PENDING",
        paypalSubscriptionId: subscriptionId,
      },
    });

    return NextResponse.json({ approveUrl });
  } catch (e) {
    await logError("billing.checkout", e);
    return NextResponse.json({ error: publicError("payment") }, { status: 502 });
  }
}
