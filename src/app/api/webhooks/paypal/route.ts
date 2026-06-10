import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, tierFromPaypalPlanId } from "@/lib/paypal";
import { mapPaypalEvent } from "@/lib/paypal-events";
import { logError } from "@/lib/errors";

export const dynamic = "force-dynamic";

type PaypalWebhookEvent = {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    custom_id?: string;
    custom?: string;
    plan_id?: string;
    billing_agreement_id?: string;
    state?: string;
    status?: string;
    amount?: { total?: string; currency?: string };
    billing_info?: { next_billing_time?: string };
  };
};

/**
 * Webhook PayPal : source de vérité de l'activation des abonnements.
 * La signature est systématiquement vérifiée auprès de PayPal avant
 * tout traitement ; un appel non signé est rejeté.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const verified = await verifyWebhookSignature(req.headers, rawBody);
  if (!verified) {
    await logError("webhook.paypal", "Signature de webhook invalide ou non vérifiable");
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: PaypalWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaypalWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const mapping = mapPaypalEvent(event.event_type);
  if (!mapping) return NextResponse.json({ ok: true, ignored: true });

  try {
    if (mapping.kind === "subscription") {
      const subscriptionId = event.resource?.id;
      const userId = event.resource?.custom_id;
      if (!subscriptionId) return NextResponse.json({ ok: true });

      const tier = await tierFromPaypalPlanId(event.resource?.plan_id);
      const periodEnd = event.resource?.billing_info?.next_billing_time;

      const existing = await prisma.subscription.findFirst({
        where: { OR: [{ paypalSubscriptionId: subscriptionId }, ...(userId ? [{ userId }] : [])] },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: mapping.status,
            paypalSubscriptionId: subscriptionId,
            ...(tier ? { plan: tier } : {}),
            ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd) } : {}),
          },
        });
      } else if (userId) {
        await prisma.subscription.create({
          data: {
            userId,
            status: mapping.status,
            plan: tier ?? "SOLO",
            paypalSubscriptionId: subscriptionId,
            ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd) } : {}),
          },
        });
      }

      const targetUserId = existing?.userId ?? userId;
      if (targetUserId && mapping.status === "ACTIVE") {
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            title: "Abonnement activé",
            body: "Votre paiement a bien été reçu. Votre accès complet à ProspectPilot Local est maintenant actif.",
          },
        });
      }
    }

    if (mapping.kind === "payment") {
      const resource = event.resource;
      const subscriptionId = resource?.billing_agreement_id;
      const paypalId = resource?.id;
      if (paypalId) {
        const sub = subscriptionId
          ? await prisma.subscription.findFirst({
              where: { paypalSubscriptionId: subscriptionId },
            })
          : null;
        const userId = sub?.userId ?? resource?.custom;
        if (userId) {
          await prisma.payment.upsert({
            where: { paypalId },
            update: { status: resource?.state ?? resource?.status ?? "completed" },
            create: {
              userId,
              paypalId,
              amount: Number(resource?.amount?.total ?? 0),
              currency: resource?.amount?.currency ?? "EUR",
              status: resource?.state ?? resource?.status ?? "completed",
              eventType: event.event_type,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    await logError("webhook.paypal", e);
    // 500 → PayPal retentera la livraison de l'événement.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
