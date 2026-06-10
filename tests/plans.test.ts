import { describe, expect, it } from "vitest";
import {
  PLANS,
  auditQuotaFor,
  canCreateAudit,
  currentMonthRange,
  getPlan,
} from "@/lib/plans";

describe("plans tarifaires", () => {
  it("expose les trois plans avec les bons prix", () => {
    expect(getPlan("SOLO").priceMonthly).toBe(29);
    expect(getPlan("AGENCE").priceMonthly).toBe(79);
    expect(getPlan("PRO").priceMonthly).toBe(149);
    expect(PLANS).toHaveLength(3);
  });

  it("définit les quotas d'audits mensuels", () => {
    expect(auditQuotaFor("SOLO")).toBe(20);
    expect(auditQuotaFor("AGENCE")).toBe(100);
    expect(auditQuotaFor("PRO")).toBeNull(); // illimité
  });

  it("autorise ou refuse la création d'audit selon le quota", () => {
    expect(canCreateAudit("SOLO", 19)).toBe(true);
    expect(canCreateAudit("SOLO", 20)).toBe(false);
    expect(canCreateAudit("AGENCE", 99)).toBe(true);
    expect(canCreateAudit("AGENCE", 100)).toBe(false);
    expect(canCreateAudit("PRO", 100000)).toBe(true);
    expect(canCreateAudit(null, 0)).toBe(false); // pas d'abonnement actif
  });

  it("réserve la marque blanche et le CRM aux plans Agence et Pro", () => {
    expect(getPlan("SOLO").features.whiteLabel).toBe(false);
    expect(getPlan("AGENCE").features.whiteLabel).toBe(true);
    expect(getPlan("PRO").features.whiteLabel).toBe(true);
    expect(getPlan("SOLO").features.crm).toBe(false);
    expect(getPlan("AGENCE").features.crm).toBe(true);
    expect(getPlan("PRO").features.crm).toBe(true);
  });

  it("calcule la fenêtre du mois courant", () => {
    const { start, end } = currentMonthRange(new Date("2026-06-10T12:00:00Z"));
    expect(start.getUTCFullYear()).toBe(2026);
    expect(start.getUTCMonth()).toBe(5);
    expect(start.getUTCDate()).toBe(1);
    expect(end.getUTCMonth()).toBe(6);
    expect(end.getUTCDate()).toBe(1);
  });
});
