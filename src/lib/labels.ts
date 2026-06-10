/**
 * Libellés visibles par l'utilisateur final : langage produit uniquement,
 * jamais de vocabulaire technique ni de détail d'infrastructure.
 */

export function publicGenerationLabel(
  modelUsed: string | null | undefined,
): string {
  if (!modelUsed) return "Analyse générée";
  if (modelUsed === "local-fallback") return "Analyse générée en mode standard";
  return "Analyse générée avec succès";
}

const PUBLIC_ERRORS: Record<string, string> = {
  service: "Le service est momentanément indisponible.",
  payment:
    "Le paiement n'a pas pu être confirmé. Veuillez réessayer ou contacter le support.",
  quota: "Vous avez atteint la limite d'audits de votre forfait pour ce mois-ci.",
  auth: "Veuillez vous connecter pour continuer.",
  forbidden: "Vous n'avez pas accès à cette ressource.",
  notfound: "Ressource introuvable.",
  ratelimit: "Trop de demandes rapprochées. Merci de patienter un instant.",
  invalid: "Certaines informations saisies sont invalides. Merci de les vérifier.",
};

export function publicError(scope: string): string {
  return (
    PUBLIC_ERRORS[scope] ??
    "Une erreur est survenue. Veuillez réessayer ou contacter le support."
  );
}
