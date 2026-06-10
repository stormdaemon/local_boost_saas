import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireProfileApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchSubscription, tierFromPaypalPlanId } from "@/lib/paypal";
import { publicError } from "@/lib/labels";
import { logError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const Body = z.object({ subscriptionId: z.string().min(3).max(64) });

/**
 * Confirmation au retour de PayPal : on revérifie le statut de l'abonnement
 * auprès de PayPal côté serveur (jamais sur la seule foi du navigateur).
 * Le webhook reste la source de vérité finale.
 */
export async function POST(req: NextRequest) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: publicError("invalid") }, { status: 400 });
  }

  try {
    const sub = await fetchSubscription(parsed.data.subscriptionId);

    // L'abonnement doit appartenir à l'utilisateur connecté.
    if (sub.custom_id && sub.custom_id !== profile.id) {
      return NextResponse.json({ error: publicError("forbidden") }, { status: 403 });
    }

    if (sub.status !== "ACTIVE" && sub.status !== "APPROVED") {
      return NextResponse.json({ activated: false, status: "en attente" });
    }

    const tier = (await tierFromPaypalPlanId(sub.plan_id)) ?? undefined;
    await prisma.subscription.upsert({
      where: { userId: profile.id },
      update: {
        status: "ACTIVE",
        paypalSubscriptionId: sub.id,
        ...(tier ? { plan: tier } : {}),
        currentPeriodEnd: sub.billing_info?.next_billing_time
          ? new Date(sub.billing_info.next_billing_time)
          : null,
      },
      create: {
        userId: profile.id,
        status: "ACTIVE",
        plan: tier ?? "SOLO",
        paypalSubscriptionId: sub.id,
      },
    });

    await prisma.notification.create({
      data: {
        userId: profile.id,
        title: "Abonnement activé",
        body: "Votre paiement a bien été reçu. Votre accès complet à ProspectPilot Local est maintenant actif.",
      },
    });

    return NextResponse.json({ activated: true });
  } catch (e) {
    await logError("billing.confirm", e);
    return NextResponse.json({ error: publicError("payment") }, { status: 502 });
  }
}
