import { describe, expect, it } from "vitest";
import { buildLocalProposal } from "@/lib/fallback-proposal";

const business = {
  name: "Boulangerie Martin",
  sector: "Boulangerie / Pâtisserie",
  city: "Angers",
  website: "https://exemple.fr",
  description: null,
  targetAudience: "familles du quartier",
  mainGoal: "Attirer plus de clients locaux",
  hasGoogleBusiness: true,
  socialNetworks: ["Instagram"],
  monthlyBudget: 600,
};

describe("génération locale de proposition commerciale", () => {
  const p = buildLocalProposal(business);

  it("produit trois offres Starter / Croissance / Premium ordonnées par prix", () => {
    expect(p.offers.map((o) => o.name)).toEqual(["Starter", "Croissance", "Premium"]);
    expect(p.offers[0].priceMonthly).toBeGreaterThan(0);
    expect(p.offers[1].priceMonthly).toBeGreaterThan(p.offers[0].priceMonthly);
    expect(p.offers[2].priceMonthly).toBeGreaterThan(p.offers[1].priceMonthly);
  });

  it("détaille livrables et délais pour chaque offre", () => {
    for (const offer of p.offers) {
      expect(offer.deliverables.length).toBeGreaterThanOrEqual(3);
      expect(offer.delay.length).toBeGreaterThan(0);
      expect(offer.tagline.length).toBeGreaterThan(0);
    }
  });

  it("recommande une offre cohérente avec le budget", () => {
    expect(["Starter", "Croissance", "Premium"]).toContain(p.recommendedOffer);
    // budget 600 €/mois → l'offre recommandée doit rester abordable
    const reco = p.offers.find((o) => o.name === p.recommendedOffer)!;
    expect(reco.priceMonthly).toBeLessThanOrEqual(business.monthlyBudget * 1.5);
  });

  it("fournit argumentaire, objections traitées et prochaines étapes", () => {
    expect(p.executiveSummary.length).toBeGreaterThan(50);
    expect(p.argumentaire.length).toBeGreaterThan(50);
    expect(p.objections.length).toBeGreaterThanOrEqual(3);
    for (const o of p.objections) {
      expect(o.objection.length).toBeGreaterThan(0);
      expect(o.response.length).toBeGreaterThan(0);
    }
    expect(p.nextSteps.length).toBeGreaterThanOrEqual(3);
  });

  it("personnalise le contenu avec l'entreprise", () => {
    const all = JSON.stringify(p);
    expect(all).toContain("Boulangerie Martin");
    expect(all).toContain("Angers");
  });
});
