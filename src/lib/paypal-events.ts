export type PaypalEventMapping =
  | {
      kind: "subscription";
      status: "ACTIVE" | "CANCELLED" | "SUSPENDED" | "EXPIRED";
    }
  | { kind: "payment" };

/**
 * Mapping pur (testable) entre un type d'événement webhook PayPal et
 * l'action à appliquer sur l'abonnement interne.
 */
export function mapPaypalEvent(eventType: string): PaypalEventMapping | null {
  switch (eventType) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
    case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
      return { kind: "subscription", status: "ACTIVE" };
    case "BILLING.SUBSCRIPTION.CANCELLED":
      return { kind: "subscription", status: "CANCELLED" };
    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
      return { kind: "subscription", status: "SUSPENDED" };
    case "BILLING.SUBSCRIPTION.EXPIRED":
      return { kind: "subscription", status: "EXPIRED" };
    case "PAYMENT.SALE.COMPLETED":
      return { kind: "payment" };
    default:
      return null;
  }
}
