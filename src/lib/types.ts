export type Scores = {
  global: number;
  seoLocal: number;
  siteWeb: number;
  ficheGoogle: number;
  reputation: number;
  reseauxSociaux: number;
};

export type AuditData = {
  scores: Scores;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  priorities: {
    title: string;
    description: string;
    impact: "Élevé" | "Moyen" | "Faible";
    effort: "Élevé" | "Moyen" | "Faible";
  }[];
};

export type StrategyData = {
  vision: string;
  keywords: {
    keyword: string;
    intent: string;
    difficulty: "Faible" | "Moyenne" | "Élevée";
    priority: number;
  }[];
  pillars: { title: string; description: string; actions: string[] }[];
  quickWins: string[];
  localActions: string[];
  kpis: string[];
};

export type CalendarData = {
  weeks: {
    theme: string;
    posts: {
      day: string;
      channel: string;
      format: string;
      title: string;
      description: string;
      cta: string;
    }[];
  }[];
};

export type PitchData = {
  elevator: string;
  hook: string;
  problem: string;
  solution: string;
  proof: string;
  offer: string;
  objections: { objection: string; response: string }[];
  closing: string;
};

export type CompetitorsData = {
  summary: string;
  competitors: {
    name: string;
    type: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
    scores: {
      seoLocal: number;
      site: number;
      social: number;
      avis: number;
      reviewCount: number;
    };
  }[];
  opportunities: string[];
  threats: string[];
};

export type ProposalOffer = {
  name: "Starter" | "Croissance" | "Premium";
  tagline: string;
  priceMonthly: number;
  setupFee: number;
  delay: string;
  deliverables: string[];
};

export type ProposalData = {
  executiveSummary: string;
  recommendedOffer: string;
  offers: ProposalOffer[];
  argumentaire: string;
  objections: { objection: string; response: string }[];
  nextSteps: string[];
};

export type AssetTypeKey =
  | "AUDIT"
  | "SEO_STRATEGY"
  | "CALENDAR"
  | "PITCH"
  | "COMPETITORS"
  | "PROPOSAL";

export type ProspectStatusKey =
  | "NOUVEAU"
  | "AUDIT_GENERE"
  | "RDV_PREVU"
  | "PROPOSITION_ENVOYEE"
  | "GAGNE"
  | "PERDU";

export type AgencyBranding = {
  agencyName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  website: string | null;
  contactEmail: string | null;
  phone: string | null;
  signature: string | null;
};

export type BusinessDTO = {
  id: string;
  name: string;
  sector: string;
  city: string;
  website: string | null;
  phone: string | null;
  description: string | null;
  targetAudience: string | null;
  mainGoal: string;
  hasGoogleBusiness: boolean;
  socialNetworks: string[];
  monthlyBudget: number;
  contactName: string | null;
  status: ProspectStatusKey;
  potentialValue: number | null;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
};

export type AssetDTO<T = unknown> = {
  id: string;
  type: AssetTypeKey;
  data: T;
  modelUsed: string | null;
  createdAt: string;
};

export type RoiScenarioDTO = {
  id: string;
  name: string;
  monthlyInvestment: number;
  extraVisitors: number;
  conversionRate: number;
  closeRate: number;
  avgTicket: number;
  marginRate: number;
  purchasesPerYear: number;
  createdAt: string;
};

export type BusinessFullDTO = BusinessDTO & {
  assets: Partial<Record<AssetTypeKey, AssetDTO>>;
  roiScenarios: RoiScenarioDTO[];
  agency: AgencyBranding | null;
};
