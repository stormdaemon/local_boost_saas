import "server-only";
import type { Scores } from "./types";

export type PromptBusiness = {
  name: string;
  sector: string;
  city: string;
  website: string | null;
  description: string | null;
  targetAudience: string | null;
  mainGoal: string;
  hasGoogleBusiness: boolean;
  socialNetworks: string[];
  monthlyBudget: number;
};

function businessContext(b: PromptBusiness): string {
  return [
    `Entreprise : ${b.name}`,
    `Secteur : ${b.sector}`,
    `Ville : ${b.city}`,
    `Site web : ${b.website ?? "aucun"}`,
    `Fiche Google Business : ${b.hasGoogleBusiness ? "oui" : "non"}`,
    `Réseaux sociaux actifs : ${b.socialNetworks.length ? b.socialNetworks.join(", ") : "aucun"}`,
    `Budget marketing mensuel : ${b.monthlyBudget} €`,
    `Objectif principal : ${b.mainGoal}`,
    b.targetAudience ? `Clientèle cible : ${b.targetAudience}` : null,
    b.description ? `Description : ${b.description}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const JSON_RULES =
  "Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sans balises markdown. Tout le contenu doit être rédigé en français.";

export function auditPrompt(b: PromptBusiness, scores: Scores): string {
  return `Tu es un consultant senior en marketing digital local. Voici une entreprise locale :

${businessContext(b)}

Scores d'audit calculés (sur 100) : SEO local ${scores.seoLocal}, site web ${scores.siteWeb}, fiche Google ${scores.ficheGoogle}, réputation ${scores.reputation}, réseaux sociaux ${scores.reseauxSociaux}, score global ${scores.global}.

Rédige l'analyse qualitative de cet audit. ${JSON_RULES}
Structure exacte attendue :
{
  "summary": "synthèse de l'audit en 3-4 phrases, ton expert mais accessible",
  "strengths": ["4 points forts concrets"],
  "weaknesses": ["4 points faibles concrets"],
  "priorities": [
    { "title": "action prioritaire", "description": "comment la mettre en oeuvre concrètement", "impact": "Élevé|Moyen|Faible", "effort": "Élevé|Moyen|Faible" }
  ]
}
Donne exactement 5 priorités, classées par impact décroissant.`;
}

export function strategyPrompt(b: PromptBusiness): string {
  return `Tu es un expert SEO local francophone. Élabore une stratégie SEO locale complète pour :

${businessContext(b)}

${JSON_RULES}
Structure exacte attendue :
{
  "vision": "vision stratégique en 3 phrases",
  "keywords": [
    { "keyword": "mot-clé local précis incluant la ville ou le quartier", "intent": "transactionnelle|informationnelle|navigationnelle", "difficulty": "Faible|Moyenne|Élevée", "priority": 1 }
  ],
  "pillars": [
    { "title": "pilier stratégique", "description": "pourquoi ce pilier", "actions": ["3 actions concrètes"] }
  ],
  "quickWins": ["5 victoires rapides réalisables en moins de 2 semaines"],
  "localActions": ["5 actions d'ancrage local (partenariats, annuaires, presse locale...)"],
  "kpis": ["5 indicateurs de suivi mesurables"]
}
Donne exactement 10 mots-clés (priority de 1 à 10) et 4 piliers.`;
}

export function calendarPrompt(b: PromptBusiness): string {
  return `Tu es un social media manager spécialisé dans les commerces locaux. Crée un calendrier éditorial de 4 semaines pour :

${businessContext(b)}

Canaux à privilégier : ${b.socialNetworks.length ? b.socialNetworks.join(", ") : "Google Business et Facebook"}, plus la fiche Google Business.

${JSON_RULES}
Structure exacte attendue :
{
  "weeks": [
    {
      "theme": "thème de la semaine",
      "posts": [
        { "day": "Lundi", "channel": "Instagram", "format": "Reel|Carrousel|Photo|Story|Post Google|Article", "title": "titre accrocheur", "description": "contenu du post en 2 phrases", "cta": "appel à l'action" }
      ]
    }
  ]
}
Donne exactement 4 semaines avec 3 posts par semaine, variés en canaux et formats.`;
}

export function pitchPrompt(b: PromptBusiness): string {
  return `Tu es un coach commercial. Rédige un pitch commercial percutant que ${b.name} pourra utiliser auprès de prospects locaux à ${b.city}.

${businessContext(b)}

${JSON_RULES}
Structure exacte attendue :
{
  "elevator": "pitch de 30 secondes, à la première personne",
  "hook": "phrase d'accroche",
  "problem": "le problème du client local",
  "solution": "la solution apportée",
  "proof": "éléments de preuve et de crédibilité",
  "offer": "offre claire avec bénéfice",
  "objections": [ { "objection": "objection fréquente", "response": "réponse convaincante" } ],
  "closing": "phrase de conclusion qui invite à l'action"
}
Donne exactement 4 objections.`;
}

export function proposalPrompt(b: PromptBusiness, scores: Scores): string {
  return `Tu es directeur commercial d'une agence de marketing digital. À partir de l'audit d'un prospect, rédige une proposition commerciale complète que l'agence présentera à ${b.name} (${b.sector}, ${b.city}).

${businessContext(b)}

Scores d'audit du prospect (sur 100) : SEO local ${scores.seoLocal}, site web ${scores.siteWeb}, fiche Google ${scores.ficheGoogle}, réputation ${scores.reputation}, réseaux sociaux ${scores.reseauxSociaux}, global ${scores.global}.

${JSON_RULES}
Structure exacte attendue :
{
  "executiveSummary": "résumé exécutif de 4-5 phrases : situation, enjeu, opportunité, approche",
  "recommendedOffer": "Starter|Croissance|Premium",
  "offers": [
    {
      "name": "Starter",
      "tagline": "promesse en une phrase",
      "priceMonthly": prix mensuel en euros (nombre),
      "setupFee": frais de mise en place en euros (nombre),
      "delay": "délai de mise en oeuvre",
      "deliverables": ["4 à 5 livrables concrets"]
    }
  ],
  "argumentaire": "argumentaire de vente de 5-6 phrases, orienté résultats mesurables",
  "objections": [ { "objection": "objection probable", "response": "réponse convaincante" } ],
  "nextSteps": ["4 prochaines étapes concrètes"]
}
Donne exactement 3 offres nommées Starter, Croissance et Premium (prix croissants, calibrés sur le budget mensuel de ${b.monthlyBudget} €), 4 objections, et choisis recommendedOffer en cohérence avec le budget.`;
}

export function competitorsPrompt(b: PromptBusiness, scores: Scores): string {
  return `Tu es un analyste marché. Invente une matrice concurrentielle FICTIVE mais réaliste pour ${b.name} (${b.sector}) à ${b.city}. Les concurrents doivent être imaginaires (noms plausibles mais inventés, ne correspondant à aucune entreprise réelle connue).

${businessContext(b)}

Pour référence, les scores digitaux de ${b.name} : SEO local ${scores.seoLocal}/100, site ${scores.siteWeb}/100, réseaux sociaux ${scores.reseauxSociaux}/100.

${JSON_RULES}
Structure exacte attendue :
{
  "summary": "lecture du paysage concurrentiel en 3 phrases",
  "competitors": [
    {
      "name": "nom fictif",
      "type": "concurrent direct|concurrent indirect|leader local",
      "positioning": "positionnement en une phrase",
      "strengths": ["2 forces"],
      "weaknesses": ["2 faiblesses"],
      "scores": { "seoLocal": 0-100, "site": 0-100, "social": 0-100, "avis": 3.0-5.0, "reviewCount": 10-400 }
    }
  ],
  "opportunities": ["4 opportunités à saisir face à ces concurrents"],
  "threats": ["3 menaces à surveiller"]
}
Donne exactement 4 concurrents fictifs avec des profils variés.`;
}
