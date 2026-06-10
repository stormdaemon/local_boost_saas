import { describe, expect, it } from "vitest";
import { computeScores } from "@/lib/scoring";

const base = {
  name: "Test Co",
  city: "Lyon",
  website: "https://test.fr" as string | null,
  hasGoogleBusiness: true,
  socialNetworks: ["Instagram", "Facebook"],
  description: null,
};

describe("scores d'audit déterministes", () => {
  it("est stable entre deux appels identiques", () => {
    expect(computeScores(base)).toEqual(computeScores(base));
  });

  it("reste borné entre 0 et 100", () => {
    const s = computeScores(base);
    for (const v of Object.values(s)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("pénalise l'absence de site web et de fiche Google", () => {
    const weak = computeScores({
      ...base,
      website: null,
      hasGoogleBusiness: false,
      socialNetworks: [],
    });
    const strong = computeScores(base);
    expect(weak.global).toBeLessThan(strong.global);
    expect(weak.siteWeb).toBeLessThan(strong.siteWeb);
    expect(weak.ficheGoogle).toBeLessThan(strong.ficheGoogle);
  });
});
