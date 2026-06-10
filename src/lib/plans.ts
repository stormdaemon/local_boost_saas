export type PlanTierKey = "SOLO" | "AGENCE" | "PRO";

export type PlanDef = {
  tier: PlanTierKey;
  name: string;
  priceMonthly: number;
  tagline: string;
  target: string;
  auditQuota: number | null; // null = illimité
  features: {
    whiteLabel: boolean;
    advancedWhiteLabel: boolean;
    crm: boolean;
    sharing: boolean;
    multiProfiles: boolean;
    prioritySupport: boolean;
  };
  bullets: string[];
};

export const PLANS: PlanDef[] = [
  {
    tier: "SOLO",
    name: "Solo",
    priceMonthly: 29,
    tagline: "Pour freelance ou consultant indépendant",
    target: "Freelances web et consultants",
    auditQuota: 20,
    features: {
      whiteLabel: false,
      advancedWhiteLabel: false,
      crm: false,
      sharing: false,
      multiProfiles: false,
      prioritySupport: false,
    },
    bullets: [
      "20 audits par mois",
      "Rapports PDF",
      "Stratégie SEO locale",
      "Simulateur ROI",
      "Pitch commercial",
      "Calendrier éditorial",
      "Support standard",
    ],
  },
  {
    tier: "AGENCE",
    name: "Agence",
    priceMonthly: 79,
    tagline: "Pour petites agences et équipes commerciales",
    target: "Petites agences et équipes commerciales",
    auditQuota: 100,
    features: {
      whiteLabel: true,
      advancedWhiteLabel: false,
      crm: true,
      sharing: false,
      multiProfiles: false,
      prioritySupport: true,
    },
    bullets: [
      "100 audits par mois",
      "Marque blanche simple",
      "Logo agence sur les rapports",
      "CRM prospects léger",
      "Historique complet",
      "Modèles d'offres commerciales",
      "Support prioritaire",
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    priceMonthly: 149,
    tagline: "Pour agences avancées, réseaux ou usage intensif",
    target: "Agences avancées et réseaux",
    auditQuota: null,
    features: {
      whiteLabel: true,
      advancedWhiteLabel: true,
      crm: true,
      sharing: true,
      multiProfiles: true,
      prioritySupport: true,
    },
    bullets: [
      "Audits illimités",
      "Marque blanche avancée",
      "Rapports partageables",
      "Plusieurs profils commerciaux",
      "Suivi des prospects",
      "Export avancé",
      "Accès prioritaire aux nouveaux modules",
    ],
  },
];

export function getPlan(tier: PlanTierKey): PlanDef {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan) throw new Error(`Plan inconnu : ${tier}`);
  return plan;
}

export function auditQuotaFor(tier: PlanTierKey): number | null {
  return getPlan(tier).auditQuota;
}

export function canCreateAudit(
  tier: PlanTierKey | null | undefined,
  usedThisMonth: number,
): boolean {
  if (!tier) return false;
  const quota = auditQuotaFor(tier);
  if (quota === null) return true;
  return usedThisMonth < quota;
}

export function currentMonthRange(now: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}
