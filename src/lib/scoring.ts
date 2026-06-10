import type { Scores } from "./types";

type ScoringInput = {
  name: string;
  city: string;
  website: string | null;
  hasGoogleBusiness: boolean;
  socialNetworks: string[];
  description: string | null;
};

/** Hash stable pour produire une variation pseudo-aléatoire mais reproductible. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const clamp = (n: number, min = 5, max = 98) =>
  Math.min(max, Math.max(min, Math.round(n)));

/**
 * Scores d'audit déterministes calculés à partir des réponses d'onboarding.
 * Le jitter basé sur le hash rend chaque entreprise unique tout en restant
 * stable entre deux régénérations.
 */
export function computeScores(b: ScoringInput): Scores {
  const h = hashString(`${b.name}|${b.city}`);
  const j = (mod: number, offset = 0) => ((h >> offset) % mod);

  const ficheGoogle = b.hasGoogleBusiness ? 68 + j(20, 2) : 18 + j(14, 2);
  const siteWeb = b.website ? 58 + j(24, 4) : 15 + j(12, 4);
  const reseauxSociaux = clamp(24 + b.socialNetworks.length * 14 + j(10, 6));
  const reputation = b.hasGoogleBusiness ? 55 + j(28, 8) : 30 + j(18, 8);
  const seoLocal = clamp(
    0.4 * ficheGoogle + 0.35 * siteWeb + 0.15 * reputation + 6 + j(8, 10),
  );
  const global = clamp(
    0.28 * seoLocal +
      0.22 * ficheGoogle +
      0.2 * siteWeb +
      0.16 * reputation +
      0.14 * reseauxSociaux,
  );

  return {
    global,
    seoLocal,
    siteWeb: clamp(siteWeb),
    ficheGoogle: clamp(ficheGoogle),
    reputation: clamp(reputation),
    reseauxSociaux,
  };
}
