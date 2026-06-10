import "server-only";
import { prisma } from "./prisma";
import {
  auditQuotaFor,
  canCreateAudit,
  currentMonthRange,
  getPlan,
  type PlanTierKey,
} from "./plans";

export type Entitlements = {
  tier: PlanTierKey | null;
  status: string;
  isActive: boolean;
  usedThisMonth: number;
  quota: number | null;
  canCreateAudit: boolean;
  features: ReturnType<typeof getPlan>["features"] | null;
};

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const isActive = sub?.status === "ACTIVE" && Boolean(sub.plan);
  const tier = isActive ? (sub!.plan as PlanTierKey) : null;

  const { start, end } = currentMonthRange();
  const usedThisMonth = await prisma.usageLog.count({
    where: { userId, kind: "AUDIT", createdAt: { gte: start, lt: end } },
  });

  return {
    tier,
    status: sub?.status ?? "NONE",
    isActive,
    usedThisMonth,
    quota: tier ? auditQuotaFor(tier) : 0,
    canCreateAudit: canCreateAudit(tier, usedThisMonth),
    features: tier ? getPlan(tier).features : null,
  };
}
