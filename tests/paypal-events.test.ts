import { describe, expect, it } from "vitest";
import { mapPaypalEvent } from "@/lib/paypal-events";

describe("mapping des événements webhook PayPal", () => {
  it("active l'abonnement à l'activation", () => {
    expect(mapPaypalEvent("BILLING.SUBSCRIPTION.ACTIVATED")).toEqual({
      kind: "subscription",
      status: "ACTIVE",
    });
  });

  it("gère le cycle de vie complet de l'abonnement", () => {
    expect(mapPaypalEvent("BILLING.SUBSCRIPTION.CANCELLED")).toEqual({
      kind: "subscription",
      status: "CANCELLED",
    });
    expect(mapPaypalEvent("BILLING.SUBSCRIPTION.SUSPENDED")).toEqual({
      kind: "subscription",
      status: "SUSPENDED",
    });
    expect(mapPaypalEvent("BILLING.SUBSCRIPTION.EXPIRED")).toEqual({
      kind: "subscription",
      status: "EXPIRED",
    });
    expect(mapPaypalEvent("BILLING.SUBSCRIPTION.PAYMENT.FAILED")).toEqual({
      kind: "subscription",
      status: "SUSPENDED",
    });
  });

  it("reconnaît les paiements encaissés", () => {
    expect(mapPaypalEvent("PAYMENT.SALE.COMPLETED")).toEqual({ kind: "payment" });
  });

  it("ignore les événements inconnus", () => {
    expect(mapPaypalEvent("CHECKOUT.ORDER.APPROVED")).toBeNull();
    expect(mapPaypalEvent("")).toBeNull();
  });
});
