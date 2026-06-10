import { describe, expect, it } from "vitest";
import { publicError, publicGenerationLabel } from "@/lib/labels";

const FORBIDDEN = /webhook|prisma|supabase|gemini|fallback|env|database|api[_ ]?key|debug|mock|netlify/i;

describe("libellés produit (aucun terme technique visible)", () => {
  it("traduit le moteur utilisé en langage produit", () => {
    expect(publicGenerationLabel("gemini-2.5-flash")).toBe("Analyse générée avec succès");
    expect(publicGenerationLabel("gemini-3.1-flash-lite")).toBe(
      "Analyse générée avec succès",
    );
    expect(publicGenerationLabel("local-fallback")).toBe(
      "Analyse générée en mode standard",
    );
    expect(publicGenerationLabel(null)).toBe("Analyse générée");
  });

  it("ne laisse jamais fuiter de vocabulaire technique", () => {
    for (const label of [
      publicGenerationLabel("gemini-2.5-pro"),
      publicGenerationLabel("local-fallback"),
      publicGenerationLabel(null),
    ]) {
      expect(label).not.toMatch(FORBIDDEN);
    }
  });

  it("fournit des messages d'erreur propres pour chaque domaine", () => {
    expect(publicError("service")).toBe("Le service est momentanément indisponible.");
    expect(publicError("payment")).toMatch(/paiement/i);
    expect(publicError("quota")).toMatch(/quota|limite/i);
    expect(publicError("auth")).toMatch(/connect|session/i);
    expect(publicError("notfound")).toMatch(/introuvable/i);
    // domaine inconnu → message générique sûr
    expect(publicError("anything-else")).toBe(
      "Une erreur est survenue. Veuillez réessayer ou contacter le support.",
    );
  });

  it("aucun message d'erreur ne contient de détail interne", () => {
    for (const scope of ["service", "payment", "quota", "auth", "notfound", "x"]) {
      expect(publicError(scope)).not.toMatch(FORBIDDEN);
    }
  });
});
