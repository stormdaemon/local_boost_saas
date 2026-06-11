import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Check,
  Clock,
  Compass,
  FileSignature,
  FileText,
  Gauge,
  Handshake,
  Megaphone,
  Palette,
  Quote,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { PLANS } from "@/lib/plans";

const BENEFITS = [
  {
    icon: Gauge,
    title: "Audit digital local en quelques minutes",
    text: "Six scores clairs sur la visibilité du prospect : référencement local, site web, fiche Google, avis, réseaux sociaux. De quoi ouvrir n'importe quel rendez-vous.",
  },
  {
    icon: Search,
    title: "Stratégie SEO locale argumentée",
    text: "Mots-clés géolocalisés, plan d'action par piliers, victoires rapides : la recommandation est prête avant même le premier appel.",
  },
  {
    icon: TrendingUp,
    title: "Simulateur de ROI qui convainc",
    text: "Montrez au prospect ce que rapporte chaque euro investi : nouveaux clients, chiffre d'affaires projeté et seuil de rentabilité sur 12 mois.",
  },
  {
    icon: FileSignature,
    title: "Proposition commerciale prête à signer",
    text: "Trois niveaux d'offre chiffrés, argumentaire, objections traitées et prochaines étapes : le devis se rédige tout seul.",
  },
  {
    icon: CalendarDays,
    title: "Calendrier éditorial sur 4 semaines",
    text: "Un mois de publications prêtes à l'emploi pour démontrer immédiatement la valeur de votre accompagnement.",
  },
  {
    icon: Palette,
    title: "Marque blanche intégrale",
    text: "Votre logo, vos couleurs, vos coordonnées : chaque rapport sort aux couleurs de votre agence, pas des nôtres.",
  },
];

const USE_CASES = [
  {
    icon: Briefcase,
    title: "Freelances web",
    text: "Arrivez en rendez-vous avec un rapport professionnel qui justifie vos tarifs et raccourcit la négociation.",
  },
  {
    icon: Search,
    title: "Agences SEO",
    text: "Automatisez les pré-audits prospects et concentrez vos consultants sur les missions facturées.",
  },
  {
    icon: Users,
    title: "Consultants marketing",
    text: "Structurez votre diagnostic et votre recommandation dans un document unique, présentable tel quel.",
  },
  {
    icon: Handshake,
    title: "Commerciaux terrain",
    text: "Générez l'audit dans la voiture avant le rendez-vous et déroulez le mode présentation face au client.",
  },
];

const TESTIMONIALS = [
  {
    name: "Claire B.",
    role: "Fondatrice d'une agence web, Nantes",
    text: "Avant, chaque pré-audit me coûtait une demi-journée. Maintenant je le génère pendant mon café et j'arrive en rendez-vous avec un rapport à mes couleurs. J'ai signé 3 clients le premier mois.",
  },
  {
    name: "Mehdi K.",
    role: "Freelance SEO, Lyon",
    text: "Le simulateur de ROI a changé mes rendez-vous : le client voit ce qu'il gagne, pas ce qu'il dépense. La discussion passe du prix à la date de démarrage.",
  },
  {
    name: "Sophie R.",
    role: "Directrice commerciale, réseau de franchises",
    text: "Mes commerciaux génèrent l'audit avant chaque visite. Le mode présentation est devenu notre script de vente. Le taux de closing a clairement progressé.",
  },
];

const FAQ = [
  {
    q: "Comment l'audit est-il généré ?",
    a: "Vous renseignez l'entreprise locale en deux minutes (secteur, ville, présence digitale, objectifs). ProspectPilot Local produit alors l'audit complet : scores, analyse, stratégie SEO locale, projection de retour sur investissement et proposition commerciale.",
  },
  {
    q: "Les rapports sont-ils vraiment en marque blanche ?",
    a: "Oui. À partir du forfait Agence, vos rapports affichent votre logo, votre couleur, vos coordonnées et votre signature commerciale. Aucune mention de ProspectPilot n'apparaît face à votre client.",
  },
  {
    q: "Puis-je exporter les rapports en PDF ?",
    a: "Chaque rapport dispose d'un bouton d'export PDF avec une mise en page d'impression dédiée, prête à être envoyée ou imprimée pour le rendez-vous.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "L'abonnement est mensuel, sans engagement, réglé par PayPal. Votre accès est activé automatiquement dès la confirmation du paiement, et vous pouvez résilier à tout moment.",
  },
  {
    q: "Que se passe-t-il si j'atteins mon quota d'audits ?",
    a: "Le forfait Solo inclut 20 audits par mois et le forfait Agence 100. Le compteur se remet à zéro chaque mois, et vous pouvez passer au forfait supérieur à tout moment. Le forfait Pro est illimité.",
  },
  {
    q: "Les données de mes prospects sont-elles protégées ?",
    a: "Oui. Chaque compte est isolé : vos prospects, audits et propositions ne sont visibles que par vous. Les données sont hébergées dans l'Union européenne et traitées conformément au RGPD.",
  },
];

function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-12 text-center">
      <p className="text-sm font-black uppercase tracking-[0.25em] gradient-text">
        {kicker}
      </p>
      <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-white/55">{subtitle}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "ProspectPilot Local",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Logiciel d'audit digital local et de proposition commerciale en marque blanche pour agences web, freelances et consultants SEO.",
        offers: PLANS.map((p) => ({
          "@type": "Offer",
          name: `Forfait ${p.name}`,
          price: p.priceMonthly,
          priceCurrency: "EUR",
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-[55%] -left-40 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-[30%] -right-40 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Navigation */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-5 w-5 text-white" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-white min-[520px]:inline">
            ProspectPilot <span className="gradient-text">Local</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#tarifs"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:text-white sm:block"
          >
            Tarifs
          </Link>
          <Link
            href="/blog"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:text-white sm:block"
          >
            Blog
          </Link>
          <Link href="/login" className="btn-ghost px-4 py-2 text-sm">
            Connexion
          </Link>
          <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
            Essayer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-14 pb-16 text-center sm:pt-20">
        <div className="chip mx-auto mb-6 border-indigo-400/30 bg-indigo-400/10 text-indigo-200">
          <Clock className="h-3.5 w-3.5" />
          Un audit prospect complet en moins de 5 minutes
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
          L&apos;audit digital local qui{" "}
          <span className="gradient-text">fait signer vos prospects</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          ProspectPilot Local génère pour chaque prospect un audit SEO local, une
          stratégie, un simulateur de ROI, un calendrier éditorial et une
          proposition commerciale chiffrée — dans un rapport en marque blanche,
          prêt à présenter.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="btn-primary px-7 py-3 text-base">
            Créer mon premier audit
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/exemple-rapport" className="btn-ghost px-7 py-3 text-base">
            Voir un exemple de rapport
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/40">
          Sans engagement · Rapports illimités en marque blanche dès le forfait Agence
        </p>

        {/* Aperçu produit */}
        <div className="card mx-auto mt-14 max-w-4xl p-5 text-left sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Rapport stratégique digital
              </p>
              <p className="mt-1 text-xl font-bold text-white">Boulangerie Martin · Angers</p>
            </div>
            <span className="chip border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Prêt à présenter
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["73/100", "Score digital global"],
              ["+412 %", "ROI projeté sur 12 mois"],
              ["390 €/mois", "Offre recommandée"],
            ].map(([v, label]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4"
              >
                <p className="text-2xl font-extrabold gradient-text">{v}</p>
                <p className="mt-1 text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              "10 mots-clés locaux à conquérir",
              "5 actions prioritaires classées par impact",
              "12 publications planifiées sur 4 semaines",
              "4 objections client traitées",
            ].map((t) => (
              <p key={t} className="flex items-center gap-2 text-sm text-white/65">
                <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Problème / solution */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-rose-300">
              Le problème
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white">
              Chaque pré-audit vous coûte une demi-journée non facturée
            </h2>
            <ul className="mt-5 grid gap-3 text-white/65">
              {[
                "Des heures à compiler scores, captures et tableaux pour un prospect pas encore signé",
                "Des recommandations refaites à la main pour chaque rendez-vous",
                "Des devis qui traînent parce que la proposition reste « à rédiger »",
                "Une image amateur face à des concurrents mieux outillés",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card border-indigo-400/30 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              La solution
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white">
              Un dossier de vente complet, généré pendant votre café
            </h2>
            <ul className="mt-5 grid gap-3 text-white/65">
              {[
                "Renseignez le prospect en 2 minutes, l'audit se génère tout seul",
                "Stratégie, ROI, calendrier et pitch alignés dans un seul document",
                "Proposition commerciale chiffrée en trois niveaux, prête à signer",
                "Le tout à vos couleurs, avec votre logo et vos coordonnées",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary mt-6 inline-flex">
              Gagner ce temps dès aujourd&apos;hui
            </Link>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          kicker="Tout est inclus"
          title="De la prospection à la signature"
          subtitle="Chaque module est pensé pour un seul objectif : transformer un prospect local en client signé."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-3 text-indigo-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cas d'usage */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          kicker="Pour qui ?"
          title="Conçu pour ceux qui vendent du digital aux entreprises locales"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <div key={u.title} className="card p-6 text-center">
              <div className="mx-auto mb-4 inline-flex rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-3 text-indigo-300">
                <u.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
        <SectionHeading
          kicker="Tarifs"
          title="Un forfait pour chaque taille d'activité"
          subtitle="Sans engagement, résiliable à tout moment. Paiement sécurisé par PayPal, accès activé immédiatement."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const highlighted = plan.tier === "AGENCE";
            return (
              <div
                key={plan.tier}
                className={`card relative flex flex-col p-7 ${
                  highlighted
                    ? "border-indigo-400/50 shadow-[0_0_60px_-20px_rgba(99,102,241,0.6)]"
                    : ""
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-xs font-bold text-white">
                    <Star className="h-3 w-3 fill-current" />
                    Le plus choisi
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-white/50">{plan.tagline}</p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.priceMonthly} €
                  </span>
                  <span className="text-sm text-white/45"> /mois</span>
                </p>
                <ul className="mt-5 grid flex-1 gap-2.5">
                  {plan.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-white/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`${highlighted ? "btn-primary" : "btn-ghost"} mt-6 w-full`}
                >
                  Commencer
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-white/45">
          Besoin de comparer en détail ?{" "}
          <Link href="/tarifs" className="font-medium text-indigo-300 hover:text-indigo-200">
            Voir le comparatif complet des forfaits
          </Link>
        </p>
      </section>

      {/* Témoignages */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <SectionHeading kicker="Ils signent plus vite" title="Ce qu'en disent les utilisateurs" />
        <div className="grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card flex flex-col p-7">
              <Quote className="mb-4 h-7 w-7 text-indigo-300/60" />
              <p className="flex-1 text-sm leading-relaxed text-white/70">{t.text}</p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/45">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <SectionHeading kicker="FAQ" title="Questions fréquentes" />
        <div className="grid gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="card group p-0">
              <summary className="cursor-pointer list-none px-6 py-4 font-medium text-white transition hover:text-indigo-200">
                {f.q}
              </summary>
              <p className="border-t border-white/10 px-6 py-4 text-sm leading-relaxed text-white/60">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="card relative overflow-hidden p-6 text-center sm:p-10">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
          <Megaphone className="relative mx-auto mb-4 h-10 w-10 text-indigo-300" />
          <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
            Votre prochain rendez-vous mérite mieux qu&apos;un devis Word
          </h2>
          <p className="relative mx-auto mt-3 max-w-2xl text-white/60">
            Créez votre compte, renseignez votre premier prospect et présentez un
            rapport qui fait la différence — dès aujourd&apos;hui.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-7 py-3 text-base">
              Créer mon premier audit
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/exemple-rapport" className="btn-ghost px-7 py-3 text-base">
              <FileText className="h-5 w-5" />
              Voir un exemple de rapport
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
                <Compass className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-white">ProspectPilot Local</span>
            </Link>
            <p className="mt-3 text-sm text-white/45">
              L&apos;outil des agences et freelances qui transforment les audits en
              contrats.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
              Produit
            </p>
            <ul className="grid gap-2 text-sm text-white/60">
              <li><Link href="/#tarifs" className="hover:text-white">Tarifs</Link></li>
              <li><Link href="/tarifs" className="hover:text-white">Comparatif des forfaits</Link></li>
              <li><Link href="/exemple-rapport" className="hover:text-white">Exemple de rapport</Link></li>
              <li><Link href="/signup" className="hover:text-white">Créer un compte</Link></li>
              <li><Link href="/login" className="hover:text-white">Connexion</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
              Ressources
            </p>
            <ul className="grid gap-2 text-sm text-white/60">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li>
                <Link
                  href="/blog/vendre-plus-vite-prestations-web-audit-digital-local"
                  className="hover:text-white"
                >
                  Vendre avec un audit local
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/marque-blanche-arme-petites-agences"
                  className="hover:text-white"
                >
                  La marque blanche pour les agences
                </Link>
              </li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
              Légal
            </p>
            <ul className="grid gap-2 text-sm text-white/60">
              <li>
                <Link href="/legal/mentions-legales" className="hover:text-white">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/confidentialite" className="hover:text-white">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-5 text-center text-xs text-white/35">
          © {new Date().getFullYear()} ProspectPilot Local — Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
