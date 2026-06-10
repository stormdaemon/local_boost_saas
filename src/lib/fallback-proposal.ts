import "server-only";
import type { PromptBusiness } from "./prompts";
import type { ProposalData } from "./types";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(n / 10) * 10));

/**
 * Génération locale de secours d'une proposition commerciale,
 * personnalisée avec les données du prospect et calibrée sur son budget.
 */
export function buildLocalProposal(b: PromptBusiness): ProposalData {
  const budget = b.monthlyBudget || 500;
  const starterPrice = clamp(budget * 0.6, 190, 590);
  const croissancePrice = Math.max(clamp(budget * 1.2, 390, 1490), starterPrice + 100);
  const premiumPrice = Math.max(clamp(budget * 2.2, 790, 2990), croissancePrice + 200);

  const recommendedOffer =
    budget < 400 ? "Starter" : budget < 1200 ? "Croissance" : "Premium";

  const s = b.sector.toLowerCase();

  return {
    executiveSummary: `${b.name} dispose d'un vrai potentiel de croissance locale à ${b.city}, mais sa visibilité digitale ne reflète pas encore la qualité de son offre. Les clients du secteur ${s} choisissent aujourd'hui leur prestataire sur Google en quelques minutes : chaque semaine sans plan d'action est une part de marché laissée aux concurrents. Cette proposition détaille trois niveaux d'accompagnement pour transformer la présence en ligne de ${b.name} en machine à générer des clients, en cohérence avec l'objectif « ${b.mainGoal} » et un budget d'environ ${budget} € par mois.`,
    recommendedOffer,
    offers: [
      {
        name: "Starter",
        tagline: "Poser les fondations de la visibilité locale",
        priceMonthly: starterPrice,
        setupFee: 290,
        delay: "Mise en place sous 2 semaines",
        deliverables: [
          "Optimisation complète de la fiche Google Business",
          "Mise en place du dispositif de collecte d'avis clients",
          "Harmonisation des informations sur les annuaires locaux",
          "Rapport de visibilité mensuel",
        ],
      },
      {
        name: "Croissance",
        tagline: "Accélérer l'acquisition de clients locaux",
        priceMonthly: croissancePrice,
        setupFee: 490,
        delay: "Premiers résultats visibles sous 6 à 8 semaines",
        deliverables: [
          "Tout le contenu de l'offre Starter",
          `Optimisation du site pour les recherches « ${s} ${b.city} »`,
          "Calendrier éditorial et animation des réseaux sociaux (3 publications/semaine)",
          "Campagne locale sponsorisée pilotée",
          "Point stratégique mensuel de 45 minutes",
        ],
      },
      {
        name: "Premium",
        tagline: "Dominer son marché local",
        priceMonthly: premiumPrice,
        setupFee: 790,
        delay: "Programme complet déployé sous 30 jours",
        deliverables: [
          "Tout le contenu de l'offre Croissance",
          "Création de pages dédiées par service et par quartier",
          "Production de contenus premium (photos, vidéos courtes)",
          "Veille concurrentielle locale trimestrielle",
          "Ligne directe avec un consultant dédié",
        ],
      },
    ],
    argumentaire: `À ${b.city}, vos futurs clients tapent « ${s} ${b.city} » et choisissent dans les trois premiers résultats. L'enjeu n'est pas de « faire du marketing », mais d'être trouvé avant vos concurrents par des personnes déjà prêtes à acheter. Notre approche concentre chaque euro investi sur ce qui génère des demandes mesurables : la fiche Google, les avis et un site qui convertit. Avec l'offre ${recommendedOffer}, ${b.name} obtient un dispositif complet, suivi par un interlocuteur unique, avec des indicateurs simples présentés chaque mois.`,
    objections: [
      {
        objection: "C'est un budget important pour ma structure.",
        response: `Ramené au nombre de nouveaux clients nécessaires pour le rentabiliser, le seuil est très bas : souvent un à trois clients supplémentaires par mois suffisent. Le simulateur de retour sur investissement joint à ce rapport le montre précisément pour ${b.name}.`,
      },
      {
        objection: "J'ai déjà essayé la publicité, ça n'a rien donné.",
        response:
          "La publicité seule envoie du trafic vers une présence en ligne qui ne convertit pas. Nous travaillons d'abord les fondations — fiche Google, avis, site — puis seulement ensuite l'amplification. C'est l'ordre qui change tout.",
      },
      {
        objection: "Je n'ai pas le temps de m'en occuper.",
        response:
          "C'est exactement le rôle de cet accompagnement : tout est pris en charge, validé avec vous en quelques minutes par mois. Votre seul travail reste de bien accueillir les nouveaux clients.",
      },
      {
        objection: "Comment je saurai si ça fonctionne ?",
        response:
          "Chaque mois, vous recevez un rapport clair : appels reçus, demandes d'itinéraire, avis collectés, positions sur les recherches clés et demandes entrantes. Vous jugez sur des chiffres, pas sur des promesses.",
      },
    ],
    nextSteps: [
      "Validation de l'offre retenue et signature du devis",
      "Réunion de lancement de 30 minutes pour collecter les accès et les contenus",
      "Déploiement des fondations (fiche Google, avis, annuaires) sous 2 semaines",
      "Premier point de résultats à 30 jours avec indicateurs chiffrés",
    ],
  };
}
