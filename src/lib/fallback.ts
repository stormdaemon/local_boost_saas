import "server-only";
import type {
  AuditData,
  CalendarData,
  CompetitorsData,
  PitchData,
  Scores,
  StrategyData,
} from "./types";
import type { PromptBusiness } from "./prompts";

/**
 * Générateurs locaux de secours : utilisés uniquement si TOUS les modèles
 * Gemini de la chaîne de fallback échouent (clé absente, quota, réseau...).
 * Le contenu est déterministe et personnalisé avec les données d'onboarding,
 * afin que le prototype reste pleinement exploitable hors-ligne.
 */

export function buildLocalAudit(b: PromptBusiness, scores: Scores): AuditData {
  const weak = scores.siteWeb < 50 ? "votre site web" : "vos réseaux sociaux";
  return {
    scores,
    summary: `${b.name} dispose d'une présence digitale ${
      scores.global >= 60 ? "solide mais perfectible" : "encore sous-exploitée"
    } à ${b.city}. Le score global de ${scores.global}/100 reflète ${
      b.hasGoogleBusiness
        ? "une fiche Google existante qu'il faut maintenant optimiser"
        : "l'absence de fiche Google Business, levier n°1 de la visibilité locale"
    }. La priorité des 90 prochains jours : renforcer ${weak} et systématiser la collecte d'avis clients pour soutenir l'objectif « ${b.mainGoal} ».`,
    strengths: [
      b.hasGoogleBusiness
        ? "Fiche Google Business déjà créée : la fondation de la visibilité locale est posée"
        : `Marché local de ${b.city} encore peu disputé sur le digital dans le secteur ${b.sector}`,
      b.website
        ? "Un site web existant qui peut être optimisé rapidement pour le SEO local"
        : "Aucune dette technique : possibilité de partir sur des bases saines",
      b.socialNetworks.length > 0
        ? `Présence sociale active (${b.socialNetworks.join(", ")})`
        : "Une histoire locale authentique à raconter, idéale pour les réseaux sociaux",
      `Un budget mensuel de ${b.monthlyBudget} € suffisant pour des actions locales à fort impact`,
    ],
    weaknesses: [
      b.hasGoogleBusiness
        ? "Fiche Google probablement incomplète : photos, posts et questions/réponses sous-exploités"
        : "Pas de fiche Google Business : invisible sur Google Maps et le pack local",
      b.website
        ? "Site non optimisé pour les recherches « secteur + ville »"
        : "Absence de site web : aucune capture de trafic de recherche",
      "Collecte d'avis clients non systématisée",
      b.socialNetworks.length < 2
        ? "Présence trop faible sur les réseaux sociaux locaux"
        : "Contenu social irrégulier, sans calendrier éditorial",
    ],
    priorities: [
      {
        title: b.hasGoogleBusiness
          ? "Optimiser la fiche Google Business à 100 %"
          : "Créer et vérifier la fiche Google Business",
        description:
          "Compléter chaque champ, ajouter 15 photos, publier 1 post Google par semaine et répondre à tous les avis sous 48 h.",
        impact: "Élevé",
        effort: "Faible",
      },
      {
        title: "Mettre en place une machine à avis clients",
        description:
          "QR code en boutique + SMS post-achat pour viser 10 nouveaux avis Google par mois.",
        impact: "Élevé",
        effort: "Faible",
      },
      {
        title: b.website
          ? "Optimiser le site pour le SEO local"
          : "Lancer un site vitrine local d'une page",
        description: `Cibler « ${b.sector.toLowerCase()} ${b.city} » dans les titres, créer une page par service et intégrer les données structurées LocalBusiness.`,
        impact: "Élevé",
        effort: "Moyen",
      },
      {
        title: "Lancer le calendrier éditorial 4 semaines",
        description:
          "3 publications hebdomadaires : coulisses, preuve sociale et offre. Recycler chaque contenu sur la fiche Google.",
        impact: "Moyen",
        effort: "Moyen",
      },
      {
        title: "Nouer 3 partenariats locaux croisés",
        description: `Identifier 3 commerces complémentaires à ${b.city} pour des recommandations croisées et des liens locaux.`,
        impact: "Moyen",
        effort: "Faible",
      },
    ],
  };
}

export function buildLocalStrategy(b: PromptBusiness): StrategyData {
  const s = b.sector.toLowerCase();
  const c = b.city;
  return {
    vision: `Faire de ${b.name} la référence ${s} incontournable à ${c} d'ici 12 mois. La stratégie s'appuie sur la domination du pack local Google, un site optimisé pour les intentions « ${s} + ${c} » et une preuve sociale massive par les avis. Chaque euro du budget de ${b.monthlyBudget} €/mois est dirigé vers des actions mesurables.`,
    keywords: [
      { keyword: `${s} ${c}`, intent: "transactionnelle", difficulty: "Moyenne", priority: 1 },
      { keyword: `meilleur ${s} ${c}`, intent: "transactionnelle", difficulty: "Moyenne", priority: 2 },
      { keyword: `${s} près de chez moi`, intent: "transactionnelle", difficulty: "Élevée", priority: 3 },
      { keyword: `${s} ${c} avis`, intent: "navigationnelle", difficulty: "Faible", priority: 4 },
      { keyword: `${s} ${c} prix`, intent: "transactionnelle", difficulty: "Faible", priority: 5 },
      { keyword: `${s} ${c} centre-ville`, intent: "transactionnelle", difficulty: "Faible", priority: 6 },
      { keyword: `horaires ${s} ${c}`, intent: "navigationnelle", difficulty: "Faible", priority: 7 },
      { keyword: `${s} ouvert dimanche ${c}`, intent: "transactionnelle", difficulty: "Faible", priority: 8 },
      { keyword: `combien coûte un ${s} à ${c}`, intent: "informationnelle", difficulty: "Faible", priority: 9 },
      { keyword: `${b.name} ${c}`, intent: "navigationnelle", difficulty: "Faible", priority: 10 },
    ],
    pillars: [
      {
        title: "Dominer le pack local Google",
        description: "80 % des clics locaux vont aux 3 fiches du pack local : c'est la bataille prioritaire.",
        actions: [
          "Compléter la fiche Google à 100 % avec catégories principales et secondaires",
          "Publier 1 post Google par semaine avec photo et CTA",
          "Obtenir 10 avis par mois avec réponse systématique du gérant",
        ],
      },
      {
        title: "Site web orienté conversion locale",
        description: "Le site doit transformer chaque visite en appel, itinéraire ou demande de devis.",
        actions: [
          `Créer une page d'atterrissage « ${s} ${c} » avec preuves et FAQ`,
          "Ajouter les données structurées LocalBusiness et le bouton appel en mobile",
          "Mesurer appels et itinéraires via Google Analytics 4",
        ],
      },
      {
        title: "Preuve sociale et e-réputation",
        description: "Les avis sont le premier critère de choix d'un commerce local.",
        actions: [
          "Installer un QR code « Laissez-nous un avis » au point de vente",
          "Envoyer un SMS de demande d'avis 2 h après chaque prestation",
          "Mettre en avant les 3 meilleurs avis sur le site et les réseaux",
        ],
      },
      {
        title: "Ancrage local et notoriété",
        description: "Les citations locales et partenariats renforcent la légitimité aux yeux de Google et des habitants.",
        actions: [
          `S'inscrire sur les annuaires locaux de ${c} (mairie, CCI, PagesJaunes)`,
          "Proposer un article au média local et sponsoriser un événement de quartier",
          "Mettre en place 3 partenariats croisés avec des commerces complémentaires",
        ],
      },
    ],
    quickWins: [
      "Compléter 100 % des champs de la fiche Google Business",
      "Ajouter 15 photos récentes (équipe, locaux, réalisations)",
      "Répondre à tous les avis existants, même anciens",
      `Harmoniser nom/adresse/téléphone (NAP) sur tous les annuaires de ${c}`,
      "Créer le QR code d'avis et le poser en caisse",
    ],
    localActions: [
      `Partenariat de recommandation avec 3 commerces voisins de ${c}`,
      "Présence sur le marché ou l'événement annuel de la ville",
      "Offre exclusive « habitants du quartier » relayée sur Nextdoor/Facebook local",
      "Communiqué au journal local sur une actualité de l'entreprise",
      "Sponsoring d'une association sportive ou culturelle locale",
    ],
    kpis: [
      "Position moyenne dans le pack local sur les 5 mots-clés prioritaires",
      "Nombre d'avis Google et note moyenne (objectif : +10 avis/mois)",
      "Appels et demandes d'itinéraire depuis la fiche Google",
      "Trafic organique local sur le site (sessions/mois)",
      "Nombre de leads entrants attribués au digital",
    ],
  };
}

const FALLBACK_DAYS = ["Lundi", "Mercredi", "Vendredi"];

export function buildLocalCalendar(b: PromptBusiness): CalendarData {
  const channels = b.socialNetworks.length
    ? b.socialNetworks
    : ["Facebook", "Google Business"];
  const ch = (i: number) => channels[i % channels.length];
  const weeks = [
    {
      theme: "Faire connaissance — l'humain derrière l'enseigne",
      posts: [
        {
          title: `Bienvenue chez ${b.name}`,
          description: `Présentation de l'équipe et de ce qui rend ${b.name} unique à ${b.city}. Photo authentique de l'équipe au travail.`,
          format: "Photo",
          cta: "Passez nous voir, on vous attend !",
        },
        {
          title: "Les coulisses d'une journée type",
          description: "Mini-vidéo des coulisses : ouverture, préparation, premiers clients. Le contenu le plus engageant pour un commerce local.",
          format: "Reel",
          cta: "Suivez-nous pour découvrir la suite",
        },
        {
          title: "Notre histoire en 5 dates",
          description: `Carrousel retraçant l'aventure de ${b.name} : création, installation à ${b.city}, étapes clés.`,
          format: "Carrousel",
          cta: "Et vous, depuis quand nous connaissez-vous ?",
        },
      ],
    },
    {
      theme: "Preuve sociale — vos clients parlent pour vous",
      posts: [
        {
          title: "Merci pour vos avis ⭐",
          description: "Mise en avant graphique des 3 meilleurs avis Google avec remerciement personnalisé.",
          format: "Carrousel",
          cta: "Donnez-nous votre avis sur Google",
        },
        {
          title: "Avant / Après",
          description: `Une réalisation concrète pour un client de ${b.city} (anonymisée) : le résultat parle de lui-même.`,
          format: "Photo",
          cta: "Demandez votre devis gratuit",
        },
        {
          title: "Question fréquente : nos réponses",
          description: `La question qu'on nous pose le plus souvent sur le métier de ${b.sector.toLowerCase()}, avec une réponse d'expert.`,
          format: "Story",
          cta: "Posez-nous vos questions en commentaire",
        },
      ],
    },
    {
      theme: "Expertise — montrer son savoir-faire",
      posts: [
        {
          title: "3 conseils de pro",
          description: `Conseils pratiques liés au secteur ${b.sector.toLowerCase()}, utiles même sans acheter : c'est ce qui construit la confiance.`,
          format: "Carrousel",
          cta: "Enregistrez ce post pour plus tard",
        },
        {
          title: "L'erreur à éviter absolument",
          description: "Format court et percutant sur une erreur fréquente des clients, et comment l'éviter.",
          format: "Reel",
          cta: "Partagez à quelqu'un que ça peut aider",
        },
        {
          title: "Le saviez-vous ?",
          description: `Anecdote ou chiffre surprenant sur le métier, ancré dans la réalité de ${b.city}.`,
          format: "Post Google",
          cta: "Venez en discuter avec nous",
        },
      ],
    },
    {
      theme: "Passage à l'action — offre et communauté locale",
      posts: [
        {
          title: `Offre spéciale habitants de ${b.city}`,
          description: "Offre locale limitée dans le temps, réservée à la communauté : le post qui convertit.",
          format: "Photo",
          cta: "Réservez avant la fin du mois",
        },
        {
          title: "On soutient le local 🤝",
          description: `Mise en avant d'un commerce partenaire ou d'une association de ${b.city} : la communauté locale vous le rendra.`,
          format: "Photo",
          cta: "Identifiez votre commerce local préféré",
        },
        {
          title: "Récap du mois et teasing",
          description: "Bilan du mois en images et annonce de ce qui arrive le mois prochain pour fidéliser l'audience.",
          format: "Story",
          cta: "Activez la cloche pour ne rien rater",
        },
      ],
    },
  ];
  return {
    weeks: weeks.map((w) => ({
      theme: w.theme,
      posts: w.posts.map((p, i) => ({
        day: FALLBACK_DAYS[i],
        channel: ch(i),
        ...p,
      })),
    })),
  };
}

export function buildLocalPitch(b: PromptBusiness): PitchData {
  const s = b.sector.toLowerCase();
  return {
    elevator: `Chez ${b.name}, nous aidons les habitants de ${b.city} à profiter d'un service ${s} de proximité, fiable et sans mauvaise surprise. ${
      b.targetAudience ? `Nous accompagnons surtout ${b.targetAudience.toLowerCase()}. ` : ""
    }Notre force : la réactivité d'un commerce de quartier avec l'exigence d'un grand professionnel. Venez nous rencontrer, le premier échange est toujours gratuit.`,
    hook: `Savez-vous que la plupart des habitants de ${b.city} cherchent un ${s} sur Google… et choisissent celui qui inspire le plus confiance en 30 secondes ?`,
    problem: `Trouver un ${s} de confiance à ${b.city} est un vrai casse-tête : promesses floues, délais incertains, qualité inégale. Les clients veulent de la proximité, de la transparence et des preuves.`,
    solution: `${b.name} apporte une réponse simple : un interlocuteur unique, des engagements clairs et un service pensé pour les réalités locales de ${b.city}.`,
    proof: `Une clientèle locale fidèle, des avis clients positifs et une connaissance fine du terrain à ${b.city}. Nos clients nous recommandent à leurs voisins — c'est notre meilleure publicité.`,
    offer: `Un premier rendez-vous découverte gratuit et sans engagement, avec un diagnostic clair et un devis transparent sous 48 h.`,
    objections: [
      {
        objection: "C'est probablement plus cher qu'ailleurs.",
        response:
          "Nos tarifs sont alignés sur le marché local, et le devis est transparent : aucun coût caché. La proximité évite en plus les frais de déplacement.",
      },
      {
        objection: "Je n'ai pas le temps de m'en occuper maintenant.",
        response:
          "Justement : le premier échange prend 15 minutes et nous nous occupons de tout le reste. Reporter coûte souvent plus cher que d'agir.",
      },
      {
        objection: "Je travaille déjà avec quelqu'un.",
        response:
          "Très bien ! Gardez simplement notre diagnostic gratuit comme point de comparaison. Beaucoup de nos clients sont venus ainsi.",
      },
      {
        objection: "Comment être sûr de la qualité ?",
        response:
          "Lisez nos avis Google et demandez à nos clients du quartier. Nous travaillons à visage découvert, ici, à " + b.city + ".",
      },
    ],
    closing: `On se voit quand pour votre diagnostic gratuit — plutôt en début ou en fin de semaine ?`,
  };
}

export function buildLocalCompetitors(
  b: PromptBusiness,
  scores: Scores,
): CompetitorsData {
  const s = b.sector;
  const c = b.city;
  return {
    summary: `Le marché ${s.toLowerCase()} à ${c} est animé par un leader historique fort en notoriété mais vieillissant sur le digital, deux challengers actifs et un nouvel entrant agressif sur les prix. Avec un score SEO local de ${scores.seoLocal}/100, ${b.name} peut viser le top 3 du pack local en 6 mois en capitalisant sur les faiblesses digitales des acteurs établis. (Matrice fictive générée à des fins de démonstration.)`,
    competitors: [
      {
        name: `Maison ${c.split(/[\s-]/)[0]} & Fils`,
        type: "leader local",
        positioning: "L'institution historique : forte notoriété, clientèle fidèle vieillissante.",
        strengths: ["Notoriété installée depuis 25 ans", "Bouche-à-oreille puissant"],
        weaknesses: ["Site web obsolète, non mobile", "Aucune publication sociale depuis 2 ans"],
        scores: { seoLocal: 72, site: 38, social: 21, avis: 4.4, reviewCount: 310 },
      },
      {
        name: "L'Atelier Moderne",
        type: "concurrent direct",
        positioning: "Le challenger branché qui mise tout sur Instagram et l'image.",
        strengths: ["Très actif sur les réseaux sociaux", "Image de marque soignée"],
        weaknesses: ["Fiche Google incomplète", "Peu d'avis clients malgré l'audience"],
        scores: { seoLocal: 55, site: 70, social: 86, avis: 4.1, reviewCount: 64 },
      },
      {
        name: `${s.split(" ")[0]} Express ${c.charAt(0)}.`,
        type: "concurrent direct",
        positioning: "Le nouvel entrant agressif : prix cassés et promesses de rapidité.",
        strengths: ["Tarifs d'appel très bas", "Campagnes sponsorisées locales"],
        weaknesses: ["Note moyenne fragile (qualité inégale)", "Aucun ancrage local réel"],
        scores: { seoLocal: 61, site: 58, social: 47, avis: 3.6, reviewCount: 89 },
      },
      {
        name: "Comptoir des Halles",
        type: "concurrent indirect",
        positioning: "L'alternative généraliste qui capte une partie de la demande sans expertise pointue.",
        strengths: ["Emplacement très passant", "Horaires étendus"],
        weaknesses: ["Offre non spécialisée", "Expérience client impersonnelle"],
        scores: { seoLocal: 48, site: 52, social: 33, avis: 3.9, reviewCount: 142 },
      },
    ],
    opportunities: [
      "Le leader historique est quasi absent du digital : le pack local est prenable",
      "Aucun concurrent ne répond systématiquement aux avis : différenciation immédiate possible",
      "Le créneau « expertise + proximité » n'est occupé par personne sur le marché",
      "Les recherches « " + s.toLowerCase() + " " + c + " » à intention forte sont peu disputées en contenu",
    ],
    threats: [
      "Le nouvel entrant pourrait massifier ses campagnes sponsorisées locales",
      "Le challenger Instagram peut convertir son audience s'il structure sa collecte d'avis",
      "Une guerre des prix tirerait les marges du marché vers le bas",
    ],
  };
}
