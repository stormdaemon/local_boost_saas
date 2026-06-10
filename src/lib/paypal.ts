import "server-only";
import { prisma } from "./prisma";
import { getPlan, type PlanTierKey } from "./plans";

/**
 * Intégration PayPal — STRICTEMENT côté serveur.
 * PAYPAL_CLIENT_ID / PAYPAL_SECRET ne quittent jamais ce module.
 * WEBHOOK_CLIENT_ID contient l'identifiant du webhook PayPal utilisé
 * pour la vérification de signature.
 */

const BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function isPaypalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_SECRET?.trim(),
  );
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Authentification PayPal refusée (${res.status})`);
  const body = (await res.json()) as { access_token: string };
  return body.access_token;
}

async function paypalFetch<T>(
  method: "GET" | "POST",
  path: string,
  body: unknown,
  token: string,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`PayPal ${method} ${path} → ${res.status} ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Crée (au premier besoin) le produit + plan de facturation PayPal d'un palier. */
async function ensurePaypalPlanId(tier: PlanTierKey): Promise<string> {
  const existing = await prisma.paypalPlanRef.findUnique({ where: { tier } });
  if (existing) return existing.planId;

  const plan = getPlan(tier);
  const token = await getAccessToken();

  const product = await paypalFetch<{ id: string }>(
    "POST",
    "/v1/catalogs/products",
    {
      name: `ProspectPilot Local — ${plan.name}`,
      description: plan.tagline,
      type: "SERVICE",
      category: "SOFTWARE",
    },
    token,
  );

  const billingPlan = await paypalFetch<{ id: string }>(
    "POST",
    "/v1/billing/plans",
    {
      product_id: product.id,
      name: `ProspectPilot Local ${plan.name} — mensuel`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: plan.priceMonthly.toFixed(2),
              currency_code: "EUR",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 2,
      },
    },
    token,
  );

  await prisma.paypalPlanRef.create({
    data: { tier, productId: product.id, planId: billingPlan.id },
  });
  return billingPlan.id;
}

export async function createSubscriptionApproval(
  tier: PlanTierKey,
  userId: string,
  origin: string,
): Promise<{ approveUrl: string; subscriptionId: string }> {
  const planId = await ensurePaypalPlanId(tier);
  const token = await getAccessToken();

  const sub = await paypalFetch<{
    id: string;
    links: { rel: string; href: string }[];
  }>(
    "POST",
    "/v1/billing/subscriptions",
    {
      plan_id: planId,
      custom_id: userId,
      application_context: {
        brand_name: "ProspectPilot Local",
        locale: "fr-FR",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${origin}/app/billing/confirmation`,
        cancel_url: `${origin}/app/billing?annule=1`,
      },
    },
    token,
  );

  const approveUrl = sub.links.find((l) => l.rel === "approve")?.href;
  if (!approveUrl) throw new Error("PayPal n'a pas renvoyé de lien d'approbation");
  return { approveUrl, subscriptionId: sub.id };
}

export type PaypalSubscription = {
  id: string;
  status: string;
  custom_id?: string;
  plan_id?: string;
  billing_info?: { next_billing_time?: string };
};

export async function fetchSubscription(
  subscriptionId: string,
): Promise<PaypalSubscription> {
  const token = await getAccessToken();
  return paypalFetch<PaypalSubscription>(
    "GET",
    `/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    undefined,
    token,
  );
}

/** Vérifie la signature d'un webhook PayPal auprès de PayPal lui-même. */
export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.WEBHOOK_CLIENT_ID?.trim();
  if (!webhookId || !isPaypalConfigured()) return false;
  try {
    const token = await getAccessToken();
    const result = await paypalFetch<{ verification_status: string }>(
      "POST",
      "/v1/notifications/verify-webhook-signature",
      {
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      },
      token,
    );
    return result.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

export async function tierFromPaypalPlanId(
  planId: string | undefined,
): Promise<PlanTierKey | null> {
  if (!planId) return null;
  const ref = await prisma.paypalPlanRef.findFirst({ where: { planId } });
  return (ref?.tier as PlanTierKey | undefined) ?? null;
}
